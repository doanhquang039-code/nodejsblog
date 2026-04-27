// ============================================
// REAL-TIME NOTIFICATION SERVICE
// ============================================

const { Sequelize, Op } = require('sequelize');
const db = require('../models');

class RealtimeNotificationService {
    // WebSocket connections storage
    static connections = new Map();

    /**
     * Register WebSocket connection
     */
    static registerConnection(userId, ws) {
        if (!this.connections.has(userId)) {
            this.connections.set(userId, new Set());
        }
        this.connections.get(userId).add(ws);
        
        console.log(`User ${userId} connected. Total connections: ${this.connections.get(userId).size}`);
    }

    /**
     * Unregister WebSocket connection
     */
    static unregisterConnection(userId, ws) {
        if (this.connections.has(userId)) {
            this.connections.get(userId).delete(ws);
            if (this.connections.get(userId).size === 0) {
                this.connections.delete(userId);
            }
        }
    }

    /**
     * Send notification to user via WebSocket
     */
    static sendToUser(userId, notification) {
        const userConnections = this.connections.get(userId);
        if (userConnections) {
            const message = JSON.stringify({
                type: 'notification',
                data: notification
            });
            
            userConnections.forEach(ws => {
                if (ws.readyState === 1) { // OPEN
                    ws.send(message);
                }
            });
        }
    }

    /**
     * Create and send notification
     */
    static async createNotification(data) {
        try {
            const notification = await db.RealtimeNotification.create({
                user_id: data.userId,
                type: data.type,
                title: data.title,
                message: data.message,
                data: data.data || null,
                link: data.link || null,
                priority: data.priority || 'normal',
                is_realtime: true
            });

            // Send via WebSocket if user is online
            this.sendToUser(data.userId, notification);

            // Check user preferences for push notifications
            const preferences = await db.NotificationPreference.findOne({
                where: { user_id: data.userId }
            });

            if (preferences && preferences.push_notifications) {
                // Send push notification (will be handled by push service)
                await this.sendPushNotification(data.userId, {
                    title: data.title,
                    body: data.message,
                    data: data.data
                });
            }

            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    /**
     * Get user notifications
     */
    static async getUserNotifications(userId, options = {}) {
        const {
            page = 1,
            limit = 20,
            isRead = null,
            type = null
        } = options;

        const where = { user_id: userId };
        if (isRead !== null) where.is_read = isRead;
        if (type) where.type = type;

        const notifications = await db.RealtimeNotification.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            limit,
            offset: (page - 1) * limit
        });

        return {
            notifications: notifications.rows,
            total: notifications.count,
            page,
            totalPages: Math.ceil(notifications.count / limit),
            unreadCount: await this.getUnreadCount(userId)
        };
    }

    /**
     * Mark notification as read
     */
    static async markAsRead(notificationId, userId) {
        const notification = await db.RealtimeNotification.findOne({
            where: { id: notificationId, user_id: userId }
        });

        if (!notification) {
            throw new Error('Notification not found');
        }

        await notification.update({
            is_read: true,
            read_at: new Date()
        });

        return notification;
    }

    /**
     * Mark all notifications as read
     */
    static async markAllAsRead(userId) {
        await db.RealtimeNotification.update(
            { is_read: true, read_at: new Date() },
            { where: { user_id: userId, is_read: false } }
        );

        return { success: true };
    }

    /**
     * Get unread count
     */
    static async getUnreadCount(userId) {
        return await db.RealtimeNotification.count({
            where: { user_id: userId, is_read: false }
        });
    }

    /**
     * Delete notification
     */
    static async deleteNotification(notificationId, userId) {
        const result = await db.RealtimeNotification.destroy({
            where: { id: notificationId, user_id: userId }
        });

        if (result === 0) {
            throw new Error('Notification not found');
        }

        return { success: true };
    }

    /**
     * Get/Create notification preferences
     */
    static async getPreferences(userId) {
        let preferences = await db.NotificationPreference.findOne({
            where: { user_id: userId }
        });

        if (!preferences) {
            preferences = await db.NotificationPreference.create({
                user_id: userId,
                email_notifications: true,
                push_notifications: true,
                realtime_notifications: true,
                notification_types: {
                    like: true,
                    comment: true,
                    follow: true,
                    mention: true,
                    message: true,
                    achievement: true,
                    system: true
                }
            });
        }

        return preferences;
    }

    /**
     * Update notification preferences
     */
    static async updatePreferences(userId, data) {
        let preferences = await this.getPreferences(userId);
        
        await preferences.update(data);
        return preferences;
    }

    /**
     * Send push notification (placeholder for push service)
     */
    static async sendPushNotification(userId, data) {
        // This will be implemented by PushNotificationService
        console.log(`Push notification for user ${userId}:`, data);
    }

    /**
     * Notify on new like
     */
    static async notifyLike(postId, likerId) {
        const post = await db.Post.findByPk(postId, {
            include: [{ model: db.User, as: 'author' }]
        });

        if (!post || post.user_id === likerId) return;

        const liker = await db.User.findByPk(likerId);

        await this.createNotification({
            userId: post.user_id,
            type: 'like',
            title: 'New Like',
            message: `${liker.username} liked your post "${post.title}"`,
            link: `/posts/${post.slug}`,
            data: { postId, likerId }
        });
    }

    /**
     * Notify on new comment
     */
    static async notifyComment(commentId) {
        const comment = await db.Comment.findByPk(commentId, {
            include: [
                { model: db.User, as: 'user' },
                { model: db.Post, as: 'post', include: [{ model: db.User, as: 'author' }] }
            ]
        });

        if (!comment || comment.post.user_id === comment.user_id) return;

        await this.createNotification({
            userId: comment.post.user_id,
            type: 'comment',
            title: 'New Comment',
            message: `${comment.user.username} commented on your post "${comment.post.title}"`,
            link: `/posts/${comment.post.slug}#comment-${commentId}`,
            data: { commentId, postId: comment.post_id }
        });
    }

    /**
     * Notify on new follower
     */
    static async notifyFollow(followerId, followingId) {
        const follower = await db.User.findByPk(followerId);

        await this.createNotification({
            userId: followingId,
            type: 'follow',
            title: 'New Follower',
            message: `${follower.username} started following you`,
            link: `/profile/${follower.username}`,
            data: { followerId }
        });
    }

    /**
     * Notify on mention
     */
    static async notifyMention(mentionedUserId, mentionerId, postId, content) {
        const mentioner = await db.User.findByPk(mentionerId);
        const post = await db.Post.findByPk(postId);

        await this.createNotification({
            userId: mentionedUserId,
            type: 'mention',
            title: 'You were mentioned',
            message: `${mentioner.username} mentioned you in "${post.title}"`,
            link: `/posts/${post.slug}`,
            data: { mentionerId, postId }
        });
    }

    /**
     * Notify on new message
     */
    static async notifyMessage(recipientId, senderId, conversationId) {
        const sender = await db.User.findByPk(senderId);

        await this.createNotification({
            userId: recipientId,
            type: 'message',
            title: 'New Message',
            message: `${sender.username} sent you a message`,
            link: `/messages/${conversationId}`,
            data: { senderId, conversationId },
            priority: 'high'
        });
    }

    /**
     * Notify on achievement unlocked
     */
    static async notifyAchievement(userId, achievementId) {
        const achievement = await db.Achievement.findByPk(achievementId);

        await this.createNotification({
            userId,
            type: 'achievement',
            title: 'Achievement Unlocked! 🏆',
            message: `You've unlocked "${achievement.name}"`,
            link: `/profile/achievements`,
            data: { achievementId },
            priority: 'high'
        });
    }

    /**
     * Send system notification
     */
    static async sendSystemNotification(userId, title, message, link = null) {
        await this.createNotification({
            userId,
            type: 'system',
            title,
            message,
            link,
            priority: 'normal'
        });
    }

    /**
     * Broadcast to all online users
     */
    static broadcastToAll(data) {
        const message = JSON.stringify({
            type: 'broadcast',
            data
        });

        this.connections.forEach((userConnections) => {
            userConnections.forEach(ws => {
                if (ws.readyState === 1) {
                    ws.send(message);
                }
            });
        });
    }

    /**
     * Get online users count
     */
    static getOnlineUsersCount() {
        return this.connections.size;
    }

    /**
     * Check if user is online
     */
    static isUserOnline(userId) {
        return this.connections.has(userId);
    }
}

module.exports = RealtimeNotificationService;
