const { Post, User, SocialShare } = require('../models');
const axios = require('axios');

class SocialController {
    // Chia sẻ bài viết lên social media
    static async sharePost(req, res) {
        try {
            const { postId, platforms } = req.body; // platforms: ['facebook', 'twitter', 'linkedin']
            const userId = req.user.id;

            const post = await Post.findByPk(postId);
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            const shareResults = [];
            
            for (const platform of platforms) {
                try {
                    const result = await SocialController.shareToplatform(post, platform, userId);
                    shareResults.push({
                        platform,
                        success: true,
                        shareUrl: result.shareUrl,
                        shareId: result.shareId
                    });

                    // Lưu thông tin share vào database
                    await SocialShare.create({
                        postId,
                        userId,
                        platform,
                        shareUrl: result.shareUrl,
                        shareId: result.shareId,
                        status: 'success'
                    });
                } catch (error) {
                    shareResults.push({
                        platform,
                        success: false,
                        error: error.message
                    });
                }
            }

            res.json({
                success: true,
                results: shareResults
            });
        } catch (error) {
            console.error('Social Share Error:', error);
            res.status(500).json({ error: 'Failed to share post' });
        }
    }

    // Lấy thống kê social media
    static async getSocialStats(req, res) {
        try {
            const { postId } = req.params;

            const shares = await SocialShare.findAll({
                where: { postId },
                attributes: ['platform', 'createdAt', 'shareUrl']
            });

            const stats = {
                totalShares: shares.length,
                byPlatform: {},
                recentShares: shares.slice(-10)
            };

            shares.forEach(share => {
                stats.byPlatform[share.platform] = (stats.byPlatform[share.platform] || 0) + 1;
            });

            res.json({
                success: true,
                stats
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to get social stats' });
        }
    }

    // Tạo social media preview
    static async generateSocialPreview(req, res) {
        try {
            const { postId } = req.params;
            const post = await Post.findByPk(postId);

            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            const preview = {
                facebook: {
                    title: post.title,
                    description: post.excerpt || post.content.substring(0, 150) + '...',
                    image: post.featuredImage,
                    url: `${process.env.APP_URL}/posts/${post.slug}`
                },
                twitter: {
                    text: `${post.title} ${process.env.APP_URL}/posts/${post.slug}`,
                    hashtags: post.tags ? post.tags.split(',').map(tag => tag.trim()) : []
                },
                linkedin: {
                    title: post.title,
                    summary: post.excerpt || post.content.substring(0, 200) + '...',
                    url: `${process.env.APP_URL}/posts/${post.slug}`
                }
            };

            res.json({
                success: true,
                preview
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to generate preview' });
        }
    }

    // Lên lịch đăng social media
    static async schedulePost(req, res) {
        try {
            const { postId, platforms, scheduledAt, content } = req.body;
            const userId = req.user.id;

            // Lưu lịch đăng vào database
            const scheduleData = {
                postId,
                userId,
                platforms: JSON.stringify(platforms),
                scheduledAt: new Date(scheduledAt),
                content,
                status: 'scheduled'
            };

            // Giả sử có model SocialSchedule
            // const schedule = await SocialSchedule.create(scheduleData);

            res.json({
                success: true,
                message: 'Social media post scheduled successfully',
                scheduledAt
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to schedule post' });
        }
    }

    // Lấy trending hashtags
    static async getTrendingHashtags(req, res) {
        try {
            const { platform = 'twitter' } = req.query;

            // Simulate trending hashtags (có thể tích hợp với Twitter API)
            const trendingHashtags = {
                twitter: ['#webdev', '#javascript', '#nodejs', '#react', '#programming'],
                instagram: ['#coding', '#developer', '#tech', '#programming', '#webdevelopment'],
                linkedin: ['#technology', '#innovation', '#digitaltransformation', '#ai', '#machinelearning']
            };

            res.json({
                success: true,
                hashtags: trendingHashtags[platform] || trendingHashtags.twitter,
                platform
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to get trending hashtags' });
        }
    }

    // Helper method để share lên platform
    static async shareToplatform(post, platform, userId) {
        const shareUrl = `${process.env.APP_URL}/posts/${post.slug}`;
        
        switch (platform) {
            case 'facebook':
                return {
                    shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
                    shareId: `fb_${Date.now()}`
                };
            case 'twitter':
                const twitterText = encodeURIComponent(`${post.title} ${shareUrl}`);
                return {
                    shareUrl: `https://twitter.com/intent/tweet?text=${twitterText}`,
                    shareId: `tw_${Date.now()}`
                };
            case 'linkedin':
                return {
                    shareUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
                    shareId: `li_${Date.now()}`
                };
            default:
                throw new Error(`Unsupported platform: ${platform}`);
        }
    }
}

module.exports = SocialController;