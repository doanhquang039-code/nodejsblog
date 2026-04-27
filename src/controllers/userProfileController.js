const { User, Post, Comment, PostLike, PostBookmark, Activity, UserFollower, UserBadge } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

class UserProfileController {
    // Lấy profile đầy đủ
    static async getProfile(req, res) {
        try {
            const { username } = req.params;
            const currentUserId = req.user?.id;

            const user = await User.findOne({
                where: { username },
                attributes: { exclude: ['password'] },
                include: [
                    {
                        model: UserBadge,
                        as: 'badges',
                        where: { isActive: true },
                        required: false
                    }
                ]
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Lấy thống kê
            const [
                postsCount,
                commentsCount,
                likesReceived,
                followersCount,
                followingCount,
                isFollowing
            ] = await Promise.all([
                Post.count({ where: { authorId: user.id, status: 'published' } }),
                Comment.count({ where: { userId: user.id, status: 'approved' } }),
                PostLike.count({ 
                    include: [{ 
                        model: Post, 
                        where: { authorId: user.id } 
                    }] 
                }),
                UserFollower.count({ where: { followingId: user.id } }),
                UserFollower.count({ where: { followerId: user.id } }),
                currentUserId ? UserFollower.findOne({
                    where: { followerId: currentUserId, followingId: user.id }
                }) : null
            ]);

            // Lấy bài viết gần đây
            const recentPosts = await Post.findAll({
                where: { authorId: user.id, status: 'published' },
                attributes: ['id', 'title', 'slug', 'excerpt', 'featuredImage', 'views', 'likes', 'createdAt'],
                order: [['createdAt', 'DESC']],
                limit: 6
            });

            // Lấy activity gần đây
            const recentActivity = await Activity.findAll({
                where: { userId: user.id },
                order: [['createdAt', 'DESC']],
                limit: 10
            });

            res.json({
                success: true,
                profile: {
                    ...user.toJSON(),
                    stats: {
                        posts: postsCount,
                        comments: commentsCount,
                        likesReceived,
                        followers: followersCount,
                        following: followingCount
                    },
                    recentPosts,
                    recentActivity,
                    isFollowing: !!isFollowing
                }
            });
        } catch (error) {
            console.error('Get Profile Error:', error);
            res.status(500).json({ error: 'Failed to get profile' });
        }
    }

    // Cập nhật profile
    static async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const {
                name,
                bio,
                avatar,
                coverImage,
                location,
                website,
                twitter,
                github,
                linkedin,
                interests,
                skills
            } = req.body;

            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            await user.update({
                name,
                bio,
                avatar,
                coverImage,
                location,
                website,
                socialLinks: JSON.stringify({
                    twitter,
                    github,
                    linkedin
                }),
                interests: Array.isArray(interests) ? interests.join(',') : interests,
                skills: Array.isArray(skills) ? skills.join(',') : skills,
                updatedAt: new Date()
            });

            res.json({
                success: true,
                user: {
                    ...user.toJSON(),
                    password: undefined
                },
                message: 'Profile updated successfully'
            });
        } catch (error) {
            console.error('Update Profile Error:', error);
            res.status(500).json({ error: 'Failed to update profile' });
        }
    }

    // Đổi mật khẩu
    static async changePassword(req, res) {
        try {
            const userId = req.user.id;
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({ error: 'Current and new password are required' });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({ error: 'New password must be at least 6 characters' });
            }

            const user = await User.findByPk(userId);
            
            // Verify current password
            const isValidPassword = await bcrypt.compare(currentPassword, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await user.update({ password: hashedPassword });

            res.json({
                success: true,
                message: 'Password changed successfully'
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to change password' });
        }
    }

    // Follow/Unfollow user
    static async toggleFollow(req, res) {
        try {
            const followerId = req.user.id;
            const { userId } = req.params;

            if (followerId === parseInt(userId)) {
                return res.status(400).json({ error: 'Cannot follow yourself' });
            }

            const existingFollow = await UserFollower.findOne({
                where: { followerId, followingId: userId }
            });

            if (existingFollow) {
                // Unfollow
                await existingFollow.destroy();
                res.json({
                    success: true,
                    action: 'unfollowed',
                    message: 'Unfollowed successfully'
                });
            } else {
                // Follow
                await UserFollower.create({
                    followerId,
                    followingId: userId,
                    createdAt: new Date()
                });
                
                res.json({
                    success: true,
                    action: 'followed',
                    message: 'Followed successfully'
                });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to toggle follow' });
        }
    }

    // Lấy danh sách followers
    static async getFollowers(req, res) {
        try {
            const { userId } = req.params;
            const { page = 1, limit = 20 } = req.query;
            const offset = (page - 1) * limit;

            const followers = await UserFollower.findAndCountAll({
                where: { followingId: userId },
                include: [{
                    model: User,
                    as: 'follower',
                    attributes: ['id', 'username', 'name', 'avatar', 'bio']
                }],
                limit: parseInt(limit),
                offset,
                order: [['createdAt', 'DESC']]
            });

            res.json({
                success: true,
                followers: followers.rows,
                pagination: {
                    total: followers.count,
                    page: parseInt(page),
                    pages: Math.ceil(followers.count / limit)
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to get followers' });
        }
    }

    // Lấy danh sách following
    static async getFollowing(req, res) {
        try {
            const { userId } = req.params;
            const { page = 1, limit = 20 } = req.query;
            const offset = (page - 1) * limit;

            const following = await UserFollower.findAndCountAll({
                where: { followerId: userId },
                include: [{
                    model: User,
                    as: 'following',
                    attributes: ['id', 'username', 'name', 'avatar', 'bio']
                }],
                limit: parseInt(limit),
                offset,
                order: [['createdAt', 'DESC']]
            });

            res.json({
                success: true,
                following: following.rows,
                pagination: {
                    total: following.count,
                    page: parseInt(page),
                    pages: Math.ceil(following.count / limit)
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to get following' });
        }
    }

    // Lấy user posts
    static async getUserPosts(req, res) {
        try {
            const { username } = req.params;
            const { page = 1, limit = 10, status = 'published' } = req.query;
            const offset = (page - 1) * limit;

            const user = await User.findOne({ where: { username } });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const posts = await Post.findAndCountAll({
                where: { 
                    authorId: user.id,
                    status
                },
                include: [
                    { model: Category, attributes: ['id', 'name'] }
                ],
                attributes: ['id', 'title', 'slug', 'excerpt', 'featuredImage', 'views', 'likes', 'createdAt'],
                limit: parseInt(limit),
                offset,
                order: [['createdAt', 'DESC']]
            });

            res.json({
                success: true,
                posts: posts.rows,
                pagination: {
                    total: posts.count,
                    page: parseInt(page),
                    pages: Math.ceil(posts.count / limit)
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to get user posts' });
        }
    }

    // Lấy user activity
    static async getUserActivity(req, res) {
        try {
            const { username } = req.params;
            const { page = 1, limit = 20, type } = req.query;
            const offset = (page - 1) * limit;

            const user = await User.findOne({ where: { username } });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const whereClause = { userId: user.id };
            if (type) whereClause.activityType = type;

            const activities = await Activity.findAndCountAll({
                where: whereClause,
                limit: parseInt(limit),
                offset,
                order: [['createdAt', 'DESC']]
            });

            res.json({
                success: true,
                activities: activities.rows,
                pagination: {
                    total: activities.count,
                    page: parseInt(page),
                    pages: Math.ceil(activities.count / limit)
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to get user activity' });
        }
    }

    // Lấy user stats
    static async getUserStats(req, res) {
        try {
            const { username } = req.params;
            const { period = '30d' } = req.query;
            
            const user = await User.findOne({ where: { username } });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const days = parseInt(period.replace('d', ''));
            const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

            const [
                totalViews,
                totalLikes,
                totalComments,
                postsPublished,
                engagementRate
            ] = await Promise.all([
                Post.sum('views', { 
                    where: { 
                        authorId: user.id,
                        createdAt: { [Op.gte]: startDate }
                    }
                }),
                Post.sum('likes', { 
                    where: { 
                        authorId: user.id,
                        createdAt: { [Op.gte]: startDate }
                    }
                }),
                Comment.count({ 
                    include: [{
                        model: Post,
                        where: { authorId: user.id }
                    }],
                    where: { createdAt: { [Op.gte]: startDate } }
                }),
                Post.count({ 
                    where: { 
                        authorId: user.id,
                        status: 'published',
                        createdAt: { [Op.gte]: startDate }
                    }
                }),
                UserProfileController.calculateEngagementRate(user.id, startDate)
            ]);

            res.json({
                success: true,
                stats: {
                    period,
                    totalViews: totalViews || 0,
                    totalLikes: totalLikes || 0,
                    totalComments: totalComments || 0,
                    postsPublished,
                    engagementRate
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to get user stats' });
        }
    }

    // Helper methods
    static async calculateEngagementRate(userId, startDate) {
        const posts = await Post.findAll({
            where: { 
                authorId: userId,
                createdAt: { [Op.gte]: startDate }
            },
            attributes: ['views', 'likes', 'shares']
        });

        if (posts.length === 0) return 0;

        const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
        const totalEngagements = posts.reduce((sum, post) => 
            sum + (post.likes || 0) + (post.shares || 0), 0
        );

        return totalViews > 0 ? ((totalEngagements / totalViews) * 100).toFixed(2) : 0;
    }
}

module.exports = UserProfileController;