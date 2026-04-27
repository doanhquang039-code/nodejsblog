// ============================================
// MESSAGING SERVICE
// ============================================

const { Op } = require('sequelize');
const db = require('../models');

class MessagingService {
    /**
     * Create conversation
     */
    static async createConversation(userId, data) {
        const { type, name, participantIds } = data;

        // Create conversation
        const conversation = await db.Conversation.create({
            type: type || 'direct',
            name: name || null,
            created_by: userId
        });

        // Add participants
        const participants = [userId, ...participantIds].map(id => ({
            conversation_id: conversation.id,
            user_id: id,
            role: id === userId ? 'admin' : 'member'
        }));

        await db.ConversationParticipant.bulkCreate(participants);

        return await this.getConversation(conversation.id, userId);
    }

    /**
     * Get user conversations
     */
    static async getUserConversations(userId, options = {}) {
        const { page = 1, limit = 20 } = options;

        const conversations = await db.Conversation.findAndCountAll({
            include: [
                {
                    model: db.ConversationParticipant,
                    as: 'participants',
                    where: { user_id: userId },
                    required: true
                },
                {
                    model: db.Message,
                    as: 'lastMessage',
                    required: false
                }
            ],
            order: [['last_message_at', 'DESC']],
            limit,
            offset: (page - 1) * limit
        });

        return {
            conversations: conversations.rows,
            total: conversations.count,
            page,
            totalPages: Math.ceil(conversations.count / limit)
        };
    }

    /**
     * Get conversation
     */
    static async getConversation(conversationId, userId) {
        const conversation = await db.Conversation.findByPk(conversationId, {
            include: [
                {
                    model: db.ConversationParticipant,
                    as: 'participants',
                    include: [{ model: db.User, as: 'user' }]
                }
            ]
        });

        if (!conversation) {
            throw new Error('Conversation not found');
        }

        // Check if user is participant
        const isParticipant = conversation.participants.some(p => p.user_id === userId);
        if (!isParticipant) {
            throw new Error('Access denied');
        }

        return conversation;
    }

    /**
     * Send message
     */
    static async sendMessage(userId, conversationId, data) {
        // Verify user is participant
        await this.getConversation(conversationId, userId);

        const message = await db.Message.create({
            conversation_id: conversationId,
            sender_id: userId,
            message_type: data.message_type || 'text',
            content: data.content,
            attachments: data.attachments || null,
            reply_to_id: data.reply_to_id || null
        });

        // Update conversation last_message
        await db.Conversation.update(
            {
                last_message_id: message.id,
                last_message_at: message.created_at
            },
            { where: { id: conversationId } }
        );

        // Send real-time notification to other participants
        const conversation = await this.getConversation(conversationId, userId);
        const otherParticipants = conversation.participants
            .filter(p => p.user_id !== userId)
            .map(p => p.user_id);

        // Notify via WebSocket (will be handled by notification service)
        const RealtimeNotificationService = require('./realtimeNotificationService');
        for (const participantId of otherParticipants) {
            await RealtimeNotificationService.notifyMessage(participantId, userId, conversationId);
        }

        return message;
    }

    /**
     * Get messages
     */
    static async getMessages(conversationId, userId, options = {}) {
        // Verify access
        await this.getConversation(conversationId, userId);

        const { page = 1, limit = 50 } = options;

        const messages = await db.Message.findAndCountAll({
            where: {
                conversation_id: conversationId,
                is_deleted: false
            },
            include: [
                { model: db.User, as: 'sender' },
                { model: db.Message, as: 'replyTo' }
            ],
            order: [['created_at', 'DESC']],
            limit,
            offset: (page - 1) * limit
        });

        return {
            messages: messages.rows.reverse(),
            total: messages.count,
            page,
            totalPages: Math.ceil(messages.count / limit)
        };
    }

    /**
     * Edit message
     */
    static async editMessage(messageId, userId, content) {
        const message = await db.Message.findByPk(messageId);

        if (!message) {
            throw new Error('Message not found');
        }

        if (message.sender_id !== userId) {
            throw new Error('Access denied');
        }

        await message.update({
            content,
            is_edited: true
        });

        return message;
    }

    /**
     * Delete message
     */
    static async deleteMessage(messageId, userId) {
        const message = await db.Message.findByPk(messageId);

        if (!message) {
            throw new Error('Message not found');
        }

        if (message.sender_id !== userId) {
            throw new Error('Access denied');
        }

        await message.update({ is_deleted: true });

        return { success: true };
    }

    /**
     * Add reaction
     */
    static async addReaction(messageId, userId, emoji) {
        const message = await db.Message.findByPk(messageId);

        if (!message) {
            throw new Error('Message not found');
        }

        const reaction = await db.MessageReaction.create({
            message_id: messageId,
            user_id: userId,
            emoji
        });

        return reaction;
    }

    /**
     * Remove reaction
     */
    static async removeReaction(messageId, userId, emoji) {
        await db.MessageReaction.destroy({
            where: {
                message_id: messageId,
                user_id: userId,
                emoji
            }
        });

        return { success: true };
    }

    /**
     * Mark conversation as read
     */
    static async markAsRead(conversationId, userId) {
        const participant = await db.ConversationParticipant.findOne({
            where: {
                conversation_id: conversationId,
                user_id: userId
            }
        });

        if (!participant) {
            throw new Error('Not a participant');
        }

        await participant.update({
            last_read_at: new Date()
        });

        return { success: true };
    }

    /**
     * Get unread count
     */
    static async getUnreadCount(userId) {
        const conversations = await db.ConversationParticipant.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: db.Conversation,
                    as: 'conversation',
                    include: [
                        {
                            model: db.Message,
                            as: 'messages',
                            where: {
                                created_at: {
                                    [Op.gt]: db.Sequelize.col('ConversationParticipant.last_read_at')
                                }
                            },
                            required: false
                        }
                    ]
                }
            ]
        });

        let totalUnread = 0;
        conversations.forEach(conv => {
            if (conv.conversation && conv.conversation.messages) {
                totalUnread += conv.conversation.messages.length;
            }
        });

        return totalUnread;
    }
}

module.exports = MessagingService;
