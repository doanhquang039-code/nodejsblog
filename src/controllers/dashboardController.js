/**
 * Dashboard Controller
 * Quản lý dashboard cho 4 role: Admin, Editor, Author, Reader
 */

const { User, Post, Comment, Category, ActivityLog, Notification } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/db');

class DashboardController {
    /**
     * Admin Dashboard
     */
    static async getAdminDashboard(req, res) {
        try {
            const userId = req.user.id;

            // Stats
            const [
                totalUsers,
                totalPosts,
                totalComments,
                totalCategories,
                activeUsers,
                publishedPosts,
                pendingComments,
                totalViews
            ] = await Promise.all([
                User.count(),
                Post.count(),
                Comment.count(),
                Category.count(),
                User.count({ where: { status: 'active' } }),
                Post.count({ where: { status: 'published' } }),
                Comment.count({ where: { status: 'pending' } }),
                Post.sum('views')
            ]);

            // Recent activities
            const recentActivities = await ActivityLog.findAll({
                limit: 10,
                order: [['created_at', 'DESC']],
                include: [{
                    model: User,
                    attributes: ['id', 'name', 'email', 'role']
                }]
            });

            // User growth (last 7 days)
            const userGrowth = await User.findAll({
                attributes: [
                    [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                where: {
                    created_at: {
                        [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                },
                group: [sequelize.fn('DATE', sequelize.col('created_at'))],
                order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
            });

            // Post analytics (last 7 days)
            const postAnalytics = await Post.findAll({
                attributes: [
                    [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                where: {
                    created_at: {
                        [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                },
                group: [sequelize.fn('DATE', sequelize.col('created_at'))],
                order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
            });

            // Top authors
            const topAuthors = await User.findAll({
                attributes: [
                    'id',
                    'name',
                    'email',
                    'role',
                    [sequelize.fn('COUNT', sequelize.col('Posts.id')), 'post_count']
                ],
                include: [{
                    model: Post,
                    attributes: [],
                    where: { status: 'published' },
                    required: false
                }],
                group: ['User.id'],
                order: [[sequelize.fn('COUNT', sequelize.col('Posts.id')), 'DESC']],
                limit: 5
            });

            // Popular posts
            const popularPosts = await Post.findAll({
                attributes: ['id', 'title', 'slug', 'views', 'likes', 'created_at'],
                where: { status: 'published' },
                order: [['views', 'DESC']],
                limit: 5,
                include: [{
                    model: User,
                    as: 'author',
                    attributes: ['id', 'name']
                }]
            });

            // Recent users
            const recentUsers = await User.findAll({
                attributes: ['id', 'name', 'email', 'role', 'status', 'created_at'],
                order: [['created_at', 'DESC']],
                limit: 5
            });

            // Role distribution
            const roleDistribution = await User.findAll({
                attributes: [
                    'role',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                group: ['role']
            });

            res.json({
                success: true,
                dashboard: 'admin',
                stats: {
                    totalUsers,
                    totalPosts,
                    totalComments,
                    totalCategories,
                    activeUsers,
                    publishedPosts,
                    pendingComments,
                    totalViews: totalViews || 0
                },
                charts: {
                    userGrowth,
                    postAnalytics,
                    roleDistribution
                },
                lists: {
                    recentActivities,
                    topAuthors,
                    popularPosts,
                    recentUsers
                }
            });
        } catch (error) {
            console.error('Admin Dashboard Error:', error);
            res.status(500).json({
                error: 'Failed to load admin dashboard'
            });
        }
    }

    /**
     * Editor Dashboard
     */
    static async getEditorDashboard(req, res) {
        try {
            const userId = req.user.id;

            // Stats
            const [
                totalPosts,
                publishedPosts,
                draftPosts,
                pendingPosts,
                totalComments,
                pendingComments,
                approvedComments,
                totalViews
            ] = await Promise.all([
                Post.count(),
                Post.count({ where: { status: 'published' } }),
                Post.count({ where: { status: 'draft' } }),
                Post.count({ where: { status: 'pending' } }),
                Comment.count(),
                Comment.count({ where: { status: 'pending' } }),
                Comment.count({ where: { status: 'approved' } }),
                Post.sum('views')
            ]);

            // Posts need review
            const postsNeedReview = await Post.findAll({
                where: { status: 'pending' },
                order: [['created_at', 'DESC']],
                limit: 10,
                include: [{
                    model: User,
                    as: 'author',
                    attributes: ['id', 'name', 'email']
                }]
            });

            // Comments need moderation
            const commentsNeedModeration = await Comment.findAll({
                where: { status: 'pending' },
                order: [['created_at', 'DESC']],
                limit: 10,
                include: [
                    {
                        model: User,
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: Post,
                        attributes: ['id', 'title', 'slug']
                    }
                ]
            });

            // Recent published posts
            const recentPublished = await Post.findAll({
                where: { status: 'published' },
                order: [['published_at', 'DESC']],
                limit: 10,
                include: [{
                    model: User,
                    as: 'author',
                    attributes: ['id', 'name']
                }]
            });

            // Post analytics by category
            const postsByCategory = await Category.findAll({
                attributes: [
                    'id',
                    'name',
                    [sequelize.fn('COUNT', sequelize.col('Posts.id')), 'post_count']
                ],
                include: [{
                    model: Post,
                    attributes: [],
                    where: { status: 'published' },
                    required: false
                }],
                group: ['Category.id'],
                order: [[sequelize.fn('COUNT', sequelize.col('Posts.id')), 'DESC']]
            });

            // Activity timeline
            const recentActivities = await ActivityLog.findAll({
                where: {
                    module: { [Op.in]: ['posts', 'comments'] }
                },
                limit: 15,
                order: [['created_at', 'DESC']],
                include: [{
                    model: User,
                    attributes: ['id', 'name', 'role']
                }]
            });

            res.json({
                success: true,
                dashboard: 'editor',
                stats: {
                    totalPosts,
                    publishedPosts,
                    draftPosts,
                    pendingPosts,
                    totalComments,
                    pendingComments,
                    approvedComments,
                    totalViews: totalViews || 0
                },
                lists: {
                    postsNeedReview,
                    commentsNeedModeration,
                    recentPublished,
                    recentActivities
                },
                charts: {
                    postsByCategory
                }
            });
        } catch (error) {
            console.error('Editor Dashboard Error:', error);
            res.status(500).json({
                error: 'Failed to load editor dashboard'
            });
        }
    }

    /**
     * Author Dashboard
     */
    static async getAuthorDashboard(req, res) {
        try {
            const userId = req.user.id;

            // Stats
            const [
                myTotalPosts,
                myPublishedPosts,
                myDraftPosts,
                myPendingPosts,
                myTotalViews,
                myTotalLikes,
                myTotalComments,
                myFollowers
            ] = await Promise.all([
                Post.count({ where: { author_id: userId } }),
                Post.count({ where: { author_id: userId, status: 'published' } }),
                Post.count({ where: { author_id: userId, status: 'draft' } }),
                Post.count({ where: { author_id: userId, status: 'pending' } }),
                Post.sum('views', { where: { author_id: userId } }),
                Post.sum('likes', { where: { author_id: userId } }),
                Comment.count({
                    include: [{
                        model: Post,
                        where: { author_id: userId }
                    }]
                }),
                // Assuming UserFollower model exists
                sequelize.query(
                    'SELECT COUNT(*) as count FROM user_followers WHERE following_id = ?',
                    {
                        replacements: [userId],
                        type: sequelize.QueryTypes.SELECT
                    }
                ).then(result => result[0]?.count || 0)
            ]);

            // My recent posts
            const myRecentPosts = await Post.findAll({
                where: { author_id: userId },
                order: [['created_at', 'DESC']],
                limit: 10,
                attributes: ['id', 'title', 'slug', 'status', 'views', 'likes', 'created_at', 'published_at']
            });

            // My popular posts
            const myPopularPosts = await Post.findAll({
                where: {
                    author_id: userId,
                    status: 'published'
                },
                order: [['views', 'DESC']],
                limit: 5,
                attributes: ['id', 'title', 'slug', 'views', 'likes', 'comments_count']
            });

            // Recent comments on my posts
            const recentComments = await Comment.findAll({
                include: [{
                    model: Post,
                    where: { author_id: userId },
                    attributes: ['id', 'title', 'slug']
                }, {
                    model: User,
                    attributes: ['id', 'name', 'avatar']
                }],
                order: [['created_at', 'DESC']],
                limit: 10
            });

            // Performance analytics (last 30 days)
            const performanceData = await Post.findAll({
                attributes: [
                    [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'posts'],
                    [sequelize.fn('SUM', sequelize.col('views')), 'views'],
                    [sequelize.fn('SUM', sequelize.col('likes')), 'likes']
                ],
                where: {
                    author_id: userId,
                    created_at: {
                        [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    }
                },
                group: [sequelize.fn('DATE', sequelize.col('created_at'))],
                order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
            });

            // Engagement rate
            const engagementRate = myTotalViews > 0
                ? (((myTotalLikes || 0) + (myTotalComments || 0)) / myTotalViews * 100).toFixed(2)
                : 0;

            res.json({
                success: true,
                dashboard: 'author',
                stats: {
                    myTotalPosts,
                    myPublishedPosts,
                    myDraftPosts,
                    myPendingPosts,
                    myTotalViews: myTotalViews || 0,
                    myTotalLikes: myTotalLikes || 0,
                    myTotalComments: myTotalComments || 0,
                    myFollowers,
                    engagementRate
                },
                lists: {
                    myRecentPosts,
                    myPopularPosts,
                    recentComments
                },
                charts: {
                    performanceData
                }
            });
        } catch (error) {
            console.error('Author Dashboard Error:', error);
            res.status(500).json({
                error: 'Failed to load author dashboard'
            });
        }
    }

    /**
     * Reader Dashboard
     */
    static async getReaderDashboard(req, res) {
        try {
            const userId = req.user.id;

            // Stats
            const [
                myBookmarks,
                myComments,
                myLikes,
                followingCount,
                readingTime
            ] = await Promise.all([
                // Assuming PostBookmark model exists
                sequelize.query(
                    'SELECT COUNT(*) as count FROM post_bookmarks WHERE user_id = ?',
                    {
                        replacements: [userId],
                        type: sequelize.QueryTypes.SELECT
                    }
                ).then(result => result[0]?.count || 0),
                Comment.count({ where: { user_id: userId } }),
                sequelize.query(
                    'SELECT COUNT(*) as count FROM post_likes WHERE user_id = ?',
                    {
                        replacements: [userId],
                        type: sequelize.QueryTypes.SELECT
                    }
                ).then(result => result[0]?.count || 0),
                sequelize.query(
                    'SELECT COUNT(*) as count FROM user_followers WHERE follower_id = ?',
                    {
                        replacements: [userId],
                        type: sequelize.QueryTypes.SELECT
                    }
                ).then(result => result[0]?.count || 0),
                // Calculate total reading time (assuming 200 words per minute)
                sequelize.query(
                    'SELECT SUM(reading_time) as total FROM post_views WHERE user_id = ?',
                    {
                        replacements: [userId],
                        type: sequelize.QueryTypes.SELECT
                    }
                ).then(result => result[0]?.total || 0)
            ]);

            // My bookmarked posts
            const myBookmarkedPosts = await sequelize.query(`
                SELECT p.id, p.title, p.slug, p.featured_image, p.excerpt, p.views, p.likes,
                       u.name as author_name, pb.created_at as bookmarked_at
                FROM posts p
                JOIN post_bookmarks pb ON p.id = pb.post_id
                JOIN users u ON p.author_id = u.id
                WHERE pb.user_id = ?
                ORDER BY pb.created_at DESC
                LIMIT 10
            `, {
                replacements: [userId],
                type: sequelize.QueryTypes.SELECT
            });

            // My recent comments
            const myRecentComments = await Comment.findAll({
                where: { user_id: userId },
                order: [['created_at', 'DESC']],
                limit: 10,
                include: [{
                    model: Post,
                    attributes: ['id', 'title', 'slug']
                }]
            });

            // Recommended posts (based on interests)
            const recommendedPosts = await Post.findAll({
                where: { status: 'published' },
                order: [
                    [sequelize.literal('(views * 0.3 + likes * 0.5 + shares * 0.2)'), 'DESC']
                ],
                limit: 10,
                attributes: ['id', 'title', 'slug', 'featured_image', 'excerpt', 'views', 'likes'],
                include: [{
                    model: User,
                    as: 'author',
                    attributes: ['id', 'name', 'avatar']
                }]
            });

            // Following authors' recent posts
            const followingPosts = await sequelize.query(`
                SELECT p.id, p.title, p.slug, p.featured_image, p.excerpt, p.created_at,
                       u.id as author_id, u.name as author_name, u.avatar as author_avatar
                FROM posts p
                JOIN users u ON p.author_id = u.id
                JOIN user_followers uf ON u.id = uf.following_id
                WHERE uf.follower_id = ? AND p.status = 'published'
                ORDER BY p.created_at DESC
                LIMIT 10
            `, {
                replacements: [userId],
                type: sequelize.QueryTypes.SELECT
            });

            // Reading history
            const readingHistory = await sequelize.query(`
                SELECT p.id, p.title, p.slug, p.featured_image,
                       pv.created_at as viewed_at, pv.reading_time
                FROM posts p
                JOIN post_views pv ON p.id = pv.post_id
                WHERE pv.user_id = ?
                ORDER BY pv.created_at DESC
                LIMIT 10
            `, {
                replacements: [userId],
                type: sequelize.QueryTypes.SELECT
            });

            res.json({
                success: true,
                dashboard: 'reader',
                stats: {
                    myBookmarks,
                    myComments,
                    myLikes,
                    followingCount,
                    readingTime: Math.round(readingTime / 60) // Convert to minutes
                },
                lists: {
                    myBookmarkedPosts,
                    myRecentComments,
                    recommendedPosts,
                    followingPosts,
                    readingHistory
                }
            });
        } catch (error) {
            console.error('Reader Dashboard Error:', error);
            res.status(500).json({
                error: 'Failed to load reader dashboard'
            });
        }
    }

    /**
     * Get dashboard based on user role
     */
    static async getDashboard(req, res) {
        try {
            const user = await User.findByPk(req.user.id);

            if (!user) {
                return res.status(404).json({
                    error: 'User not found'
                });
            }

            switch (user.role) {
                case 'admin':
                    return DashboardController.getAdminDashboard(req, res);
                case 'editor':
                    return DashboardController.getEditorDashboard(req, res);
                case 'author':
                    return DashboardController.getAuthorDashboard(req, res);
                case 'reader':
                    return DashboardController.getReaderDashboard(req, res);
                default:
                    return res.status(400).json({
                        error: 'Invalid role'
                    });
            }
        } catch (error) {
            console.error('Get Dashboard Error:', error);
            res.status(500).json({
                error: 'Failed to load dashboard'
            });
        }
    }

    /**
     * Get notifications
     */
    static async getNotifications(req, res) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 20, unread_only = false } = req.query;
            const offset = (page - 1) * limit;

            const whereClause = { user_id: userId };
            if (unread_only === 'true') {
                whereClause.is_read = false;
            }

            const notifications = await Notification.findAndCountAll({
                where: whereClause,
                order: [['created_at', 'DESC']],
                limit: parseInt(limit),
                offset
            });

            const unreadCount = await Notification.count({
                where: {
                    user_id: userId,
                    is_read: false
                }
            });

            res.json({
                success: true,
                notifications: notifications.rows,
                unreadCount,
                pagination: {
                    total: notifications.count,
                    page: parseInt(page),
                    pages: Math.ceil(notifications.count / limit)
                }
            });
        } catch (error) {
            console.error('Get Notifications Error:', error);
            res.status(500).json({
                error: 'Failed to get notifications'
            });
        }
    }

    /**
     * Mark notification as read
     */
    static async markNotificationRead(req, res) {
        try {
            const userId = req.user.id;
            const { notificationId } = req.params;

            const notification = await Notification.findOne({
                where: {
                    id: notificationId,
                    user_id: userId
                }
            });

            if (!notification) {
                return res.status(404).json({
                    error: 'Notification not found'
                });
            }

            await notification.update({
                is_read: true,
                read_at: new Date()
            });

            res.json({
                success: true,
                message: 'Notification marked as read'
            });
        } catch (error) {
            console.error('Mark Notification Read Error:', error);
            res.status(500).json({
                error: 'Failed to mark notification as read'
            });
        }
    }

    /**
     * Mark all notifications as read
     */
    static async markAllNotificationsRead(req, res) {
        try {
            const userId = req.user.id;

            await Notification.update(
                {
                    is_read: true,
                    read_at: new Date()
                },
                {
                    where: {
                        user_id: userId,
                        is_read: false
                    }
                }
            );

            res.json({
                success: true,
                message: 'All notifications marked as read'
            });
        } catch (error) {
            console.error('Mark All Notifications Read Error:', error);
            res.status(500).json({
                error: 'Failed to mark all notifications as read'
            });
        }
    }
}

module.exports = DashboardController;
