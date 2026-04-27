const { Comment, User, Post, CommentLike, CommentReport, CommentReaction, CommentMention } = require('../models');
const { Op } = require('sequelize');

class EnhancedCommentController {
    // Tạo comment với tính năng nâng cao
    static async createAdvancedComment(req, res) {
        try {
            const {
                postId,
                content,
                parentId = null,
                mentions = [],
                attachments = [],
                isAnonymous = false
            } = req.body;

            const userId = req.user.id;

            // Kiểm tra post tồn tại và cho phép comment
            const post = await Post.findByPk(postId);
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            if (!post.allowComments) {
                return res.status(403).json({ error: 'Comments are disabled for this post' });
            }

            // Kiểm tra parent comment nếu là reply
            if (parentId) {
                const parentComment = await Comment.findByPk(parentId);
                if (!parentComment || parentComment.postId !== postId) {
                    return res.status(400).json({ error: 'Invalid parent comment' });
                }
            }

            // Tạo comment
            const comment = await Comment.create({
                postId,
                userId,
                content,
                parentId,
                attachments: JSON.stringify(attachments),
                isAnonymous,
                status: 'pending', // Cần approve
                likes: 0,
                replies: 0,
                isEdited: false
            });

            // Xử lý mentions
            if (mentions && mentions.length > 0) {
                await EnhancedCommentController.processMentions(comment.id, mentions);
            }

            // Tăng comment count của post
            await Post.increment('commentCount', { where: { id: postId } });

            // Nếu là reply, tăng reply count của parent
            if (parentId) {
                await Comment.increment('replies', { where: { id: parentId } });
            }

            // Gửi notification cho author của post
            await EnhancedCommentController.notifyPostAuthor(post, comment, userId);

            res.status(201).json({
                success: true,
                comment,
                message: 'Comment created successfully. Waiting for approval.'
            });
        } catch (error) {
            console.error('Create Comment Error:', error);
            res.status(500).json({ error: 'Failed to create comment' });
        }
    }

    // Lấy comments với threading (nested replies)
    static async getThreadedComments(req, res) {
        try {
            const { postId } = req.params;
            const { page = 1, limit = 20, sortBy = 'newest' } = req.query;
            const offset = (page - 1) * limit;

            // Sorting options
            let orderClause;
            switch (sortBy) {
                case 'newest':
                    orderClause = [['createdAt', 'DESC']];
                    break;
                case 'oldest':
                    orderClause = [['createdAt', 'ASC']];
                    break;
                case 'popular':
                    orderClause = [['likes', 'DESC']];
                    break;
                default:
                    orderClause = [['createdAt', 'DESC']];
            }

            // Lấy top-level comments (không có parent)
            const comments = await Comment.findAndCountAll({
                where: {
                    postId,
                    parentId: null,
                    status: 'approved'
                },
                include: [
                    {
                        model: User,
                        attributes: ['id', 'name', 'avatar', 'role']
                    },
                    {
                        model: Comment,
                        as: 'replies',
                        where: { status: 'approved' },
                        required: false,
                        include: [
                            {
                                model: User,
                                attributes: ['id', 'name', 'avatar', 'role']
                            }
                        ],
                        order: [['createdAt', 'ASC']]
                    }
                ],
                limit: parseInt(limit),
                offset,
                order: orderClause,
                distinct: true
            });

            // Thêm thông tin reactions cho mỗi comment
            const commentsWithReactions = await Promise.all(
                comments.rows.map(async (comment) => {
                    const reactions = await EnhancedCommentController.getCommentReactions(comment.id);
                    return {
                        ...comment.toJSON(),
                        reactions
                    };
                })
            );

            res.json({
                success: true,
                comments: commentsWithReactions,
                pagination: {
                    total: comments.count,
                    page: parseInt(page),
                    pages: Math.ceil(comments.count / limit)
                }
            });
        } catch (error) {
            console.error('Get Comments Error:', error);
            res.status(500).json({ error: 'Failed to get comments' });
        }
    }

    // Edit comment
    static async editComment(req, res) {
        try {
            const { commentId } = req.params;
            const { content } = req.body;
            const userId = req.user.id;

            const comment = await Comment.findByPk(commentId);
            if (!comment) {
                return res.status(404).json({ error: 'Comment not found' });
            }

            // Kiểm tra quyền edit
            if (comment.userId !== userId && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Not authorized to edit this comment' });
            }

            // Không cho edit sau 15 phút
            const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
            if (comment.createdAt < fifteenMinutesAgo && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Edit time limit exceeded (15 minutes)' });
            }

            await comment.update({
                content,
                isEdited: true,
                editedAt: new Date()
            });

            res.json({
                success: true,
                comment,
                message: 'Comment updated successfully'
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to edit comment' });
        }
    }

    // Delete comment
    static async deleteComment(req, res) {
        try {
            const { commentId } = req.params;
            const userId = req.user.id;

            const comment = await Comment.findByPk(commentId);
            if (!comment) {
                return res.status(404).json({ error: 'Comment not found' });
            }

            // Kiểm tra quyền delete
            if (comment.userId !== userId && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Not authorized to delete this comment' });
            }

            // Soft delete
            await comment.update({ 
                status: 'deleted',
                deletedAt: new Date()
            });

            // Giảm comment count
            await Post.decrement('commentCount', { where: { id: comment.postId } });

            res.json({
                success: true,
                message: 'Comment deleted successfully'
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete comment' });
        }
    }

    // Like/Unlike comment
    static async toggleCommentLike(req, res) {
        try {
            const { commentId } = req.params;
            const userId = req.user.id;

            const existingLike = await CommentLike.findOne({
                where: { commentId, userId }
            });

            if (existingLike) {
                // Unlike
                await existingLike.destroy();
                await Comment.decrement('likes', { where: { id: commentId } });
                
                res.json({
                    success: true,
                    action: 'unliked',
                    message: 'Comment unliked'
                });
            } else {
                // Like
                await CommentLike.create({ commentId, userId });
                await Comment.increment('likes', { where: { id: commentId } });
                
                res.json({
                    success: true,
                    action: 'liked',
                    message: 'Comment liked'
                });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to toggle like' });
        }
    }

    // React to comment (emoji reactions)
    static async reactToComment(req, res) {
        try {
            const { commentId } = req.params;
            const { reactionType } = req.body; // 'like', 'love', 'haha', 'wow', 'sad', 'angry'
            const userId = req.user.id;

            const validReactions = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];
            if (!validReactions.includes(reactionType)) {
                return res.status(400).json({ error: 'Invalid reaction type' });
            }

            // Kiểm tra reaction hiện tại
            const existingReaction = await CommentReaction.findOne({
                where: { commentId, userId }
            });

            if (existingReaction) {
                if (existingReaction.reactionType === reactionType) {
                    // Remove reaction
                    await existingReaction.destroy();
                    return res.json({
                        success: true,
                        action: 'removed',
                        message: 'Reaction removed'
                    });
                } else {
                    // Update reaction
                    await existingReaction.update({ reactionType });
                    return res.json({
                        success: true,
                        action: 'updated',
                        reactionType,
                        message: 'Reaction updated'
                    });
                }
            } else {
                // Add new reaction
                await CommentReaction.create({
                    commentId,
                    userId,
                    reactionType
                });
                
                res.json({
                    success: true,
                    action: 'added',
                    reactionType,
                    message: 'Reaction added'
                });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to react to comment' });
        }
    }

    // Report comment
    static async reportComment(req, res) {
        try {
            const { commentId } = req.params;
            const { reason, description } = req.body;
            const userId = req.user.id;

            const validReasons = ['spam', 'harassment', 'hate_speech', 'misinformation', 'other'];
            if (!validReasons.includes(reason)) {
                return res.status(400).json({ error: 'Invalid report reason' });
            }

            // Kiểm tra đã report chưa
            const existingReport = await CommentReport.findOne({
                where: { commentId, userId }
            });

            if (existingReport) {
                return res.status(400).json({ error: 'You have already reported this comment' });
            }

            await CommentReport.create({
                commentId,
                userId,
                reason,
                description,
                status: 'pending'
            });

            res.json({
                success: true,
                message: 'Comment reported successfully. Our team will review it.'
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to report comment' });
        }
    }

    // Pin comment (admin/author only)
    static async pinComment(req, res) {
        try {
            const { commentId } = req.params;
            const userId = req.user.id;

            const comment = await Comment.findByPk(commentId, {
                include: [{ model: Post }]
            });

            if (!comment) {
                return res.status(404).json({ error: 'Comment not found' });
            }

            // Chỉ author của post hoặc admin mới pin được
            if (comment.Post.authorId !== userId && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Not authorized to pin comment' });
            }

            // Unpin comment khác trước
            await Comment.update(
                { isPinned: false },
                { where: { postId: comment.postId, isPinned: true } }
            );

            // Pin comment này
            await comment.update({ isPinned: !comment.isPinned });

            res.json({
                success: true,
                isPinned: comment.isPinned,
                message: comment.isPinned ? 'Comment pinned' : 'Comment unpinned'
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to pin comment' });
        }
    }

    // Lấy comment statistics
    static async getCommentStats(req, res) {
        try {
            const { postId } = req.params;

            const [
                totalComments,
                approvedComments,
                pendingComments,
                topCommenters,
                recentActivity
            ] = await Promise.all([
                Comment.count({ where: { postId } }),
                Comment.count({ where: { postId, status: 'approved' } }),
                Comment.count({ where: { postId, status: 'pending' } }),
                EnhancedCommentController.getTopCommenters(postId),
                EnhancedCommentController.getRecentActivity(postId)
            ]);

            res.json({
                success: true,
                stats: {
                    totalComments,
                    approvedComments,
                    pendingComments,
                    topCommenters,
                    recentActivity
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to get comment stats' });
        }
    }

    // Moderate comments (admin only)
    static async moderateComment(req, res) {
        try {
            const { commentId } = req.params;
            const { action, reason } = req.body; // 'approve', 'reject', 'spam'

            if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
                return res.status(403).json({ error: 'Not authorized' });
            }

            const comment = await Comment.findByPk(commentId);
            if (!comment) {
                return res.status(404).json({ error: 'Comment not found' });
            }

            let newStatus;
            switch (action) {
                case 'approve':
                    newStatus = 'approved';
                    break;
                case 'reject':
                    newStatus = 'rejected';
                    break;
                case 'spam':
                    newStatus = 'spam';
                    break;
                default:
                    return res.status(400).json({ error: 'Invalid action' });
            }

            await comment.update({
                status: newStatus,
                moderatedBy: req.user.id,
                moderatedAt: new Date(),
                moderationReason: reason
            });

            res.json({
                success: true,
                comment,
                message: `Comment ${action}ed successfully`
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to moderate comment' });
        }
    }

    // Helper methods
    static async processMentions(commentId, mentions) {
        for (const userId of mentions) {
            await CommentMention.create({
                commentId,
                userId,
                isRead: false
            });

            // Gửi notification cho user được mention
            // await NotificationService.send(userId, 'mention', commentId);
        }
    }

    static async notifyPostAuthor(post, comment, commenterId) {
        if (post.authorId !== commenterId) {
            // Gửi notification cho author
            // await NotificationService.send(post.authorId, 'new_comment', comment.id);
        }
    }

    static async getCommentReactions(commentId) {
        const reactions = await CommentReaction.findAll({
            where: { commentId },
            attributes: [
                'reactionType',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['reactionType']
        });

        return reactions.reduce((acc, reaction) => {
            acc[reaction.reactionType] = parseInt(reaction.get('count'));
            return acc;
        }, {});
    }

    static async getTopCommenters(postId) {
        return await Comment.findAll({
            where: { postId, status: 'approved' },
            attributes: [
                'userId',
                [sequelize.fn('COUNT', sequelize.col('id')), 'commentCount']
            ],
            include: [{
                model: User,
                attributes: ['id', 'name', 'avatar']
            }],
            group: ['userId'],
            order: [[sequelize.literal('commentCount'), 'DESC']],
            limit: 5
        });
    }

    static async getRecentActivity(postId) {
        return await Comment.findAll({
            where: {
                postId,
                status: 'approved',
                createdAt: {
                    [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                }
            },
            attributes: ['id', 'createdAt'],
            order: [['createdAt', 'DESC']],
            limit: 10
        });
    }
}

module.exports = EnhancedCommentController;