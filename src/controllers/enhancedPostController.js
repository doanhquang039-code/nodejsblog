const { Post, User, Category, Comment, Tag, PostView, PostLike, PostBookmark, PostShare, Media } = require('../models');
const { Op } = require('sequelize');
const slugify = require('slugify');

class EnhancedPostController {
    // Tạo post với tính năng nâng cao
    static async createAdvancedPost(req, res) {
        try {
            const {
                title,
                content,
                excerpt,
                categoryId,
                tags,
                featuredImage,
                gallery,
                status = 'draft',
                publishAt,
                seoTitle,
                seoDescription,
                allowComments = true,
                isPinned = false,
                isSponsored = false,
                readingTime,
                customFields
            } = req.body;

            const authorId = req.user.id;
            const slug = slugify(title, { lower: true, strict: true });

            // Kiểm tra slug unique
            const existingPost = await Post.findOne({ where: { slug } });
            if (existingPost) {
                return res.status(400).json({ error: 'Post with this title already exists' });
            }

            const post = await Post.create({
                title,
                content,
                excerpt: excerpt || content.substring(0, 200) + '...',
                slug,
                authorId,
                categoryId,
                tags: Array.isArray(tags) ? tags.join(',') : tags,
                featuredImage,
                gallery: JSON.stringify(gallery || []),
                status,
                publishAt: publishAt ? new Date(publishAt) : (status === 'published' ? new Date() : null),
                seoTitle: seoTitle || title,
                seoDescription: seoDescription || excerpt,
                allowComments,
                isPinned,
                isSponsored,
                readingTime: readingTime || EnhancedPostController.calculateReadingTime(content),
                customFields: JSON.stringify(customFields || {}),
                views: 0,
                likes: 0,
                shares: 0
            });

            // Tạo tags nếu chưa tồn tại
            if (tags && Array.isArray(tags)) {
                await EnhancedPostController.createOrUpdateTags(tags, post.id);
            }

            res.status(201).json({
                success: true,
                post,
                message: 'Post created successfully'
            });
        } catch (error) {
            console.error('Create Post Error:', error);
            res.status(500).json({ error: 'Failed to create post' });
        }
    }

    // Lấy post với thông tin chi tiết
    static async getPostDetails(req, res) {
        try {
            const { slug } = req.params;
            const userId = req.user?.id;

            const post = await Post.findOne({
                where: { slug },
                include: [
                    { model: User, as: 'author', attributes: ['id', 'name', 'email', 'avatar'] },
                    { model: Category, attributes: ['id', 'name', 'slug'] },
                    { 
                        model: Comment, 
                        as: 'comments',
                        where: { status: 'approved' },
                        required: false,
                        include: [{ model: User, attributes: ['id', 'name', 'avatar'] }]
                    }
                ]
            });

            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            // Tăng view count (chỉ tăng 1 lần per user per session)
            await EnhancedPostController.incrementView(post.id, userId, req.ip);

            // Lấy thông tin tương tác của user hiện tại
            let userInteractions = {};
            if (userId) {
                const [liked, bookmarked] = await Promise.all([
                    PostLike.findOne({ where: { postId: post.id, userId } }),
                    PostBookmark.findOne({ where: { postId: post.id, userId } })
                ]);

                userInteractions = {
                    liked: !!liked,
                    bookmarked: !!bookmarked
                };
            }

            // Lấy posts liên quan
            const relatedPosts = await EnhancedPostController.getRelatedPosts(post.id, post.categoryId, post.tags);

            // Lấy thống kê engagement
            const engagementStats = await EnhancedPostController.getEngagementStats(post.id);

            res.json({
                success: true,
                post: {
                    ...post.toJSON(),
                    userInteractions,
                    relatedPosts,
                    engagementStats
                }
            });
        } catch (error) {
            console.error('Get Post Error:', error);
            res.status(500).json({ error: 'Failed to get post' });
        }
    }

    // Like/Unlike post
    static async toggleLike(req, res) {
        try {
            const { postId } = req.params;
            const userId = req.user.id;

            const existingLike = await PostLike.findOne({
                where: { postId, userId }
            });

            if (existingLike) {
                // Unlike
                await existingLike.destroy();
                await Post.decrement('likes', { where: { id: postId } });
                
                res.json({
                    success: true,
                    action: 'unliked',
                    message: 'Post unliked successfully'
                });
            } else {
                // Like
                await PostLike.create({ postId, userId });
                await Post.increment('likes', { where: { id: postId } });
                
                res.json({
                    success: true,
                    action: 'liked',
                    message: 'Post liked successfully'
                });
            }
        } catch (error) {
            console.error('Toggle Like Error:', error);
            res.status(500).json({ error: 'Failed to toggle like' });
        }
    }

    // Bookmark/Unbookmark post
    static async toggleBookmark(req, res) {
        try {
            const { postId } = req.params;
            const userId = req.user.id;

            const existingBookmark = await PostBookmark.findOne({
                where: { postId, userId }
            });

            if (existingBookmark) {
                // Remove bookmark
                await existingBookmark.destroy();
                
                res.json({
                    success: true,
                    action: 'unbookmarked',
                    message: 'Post removed from bookmarks'
                });
            } else {
                // Add bookmark
                await PostBookmark.create({ 
                    postId, 
                    userId,
                    createdAt: new Date()
                });
                
                res.json({
                    success: true,
                    action: 'bookmarked',
                    message: 'Post added to bookmarks'
                });
            }
        } catch (error) {
            console.error('Toggle Bookmark Error:', error);
            res.status(500).json({ error: 'Failed to toggle bookmark' });
        }
    }

    // Lấy danh sách bookmarks của user
    static async getUserBookmarks(req, res) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const bookmarks = await PostBookmark.findAndCountAll({
                where: { userId },
                include: [{
                    model: Post,
                    attributes: ['id', 'title', 'slug', 'excerpt', 'featuredImage', 'createdAt'],
                    include: [
                        { model: User, as: 'author', attributes: ['id', 'name'] },
                        { model: Category, attributes: ['id', 'name'] }
                    ]
                }],
                limit: parseInt(limit),
                offset,
                order: [['createdAt', 'DESC']]
            });

            res.json({
                success: true,
                bookmarks: bookmarks.rows,
                pagination: {
                    total: bookmarks.count,
                    page: parseInt(page),
                    pages: Math.ceil(bookmarks.count / limit)
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to get bookmarks' });
        }
    }

    // Share post
    static async sharePost(req, res) {
        try {
            const { postId } = req.params;
            const { platform, customMessage } = req.body;
            const userId = req.user?.id;

            // Tăng share count
            await Post.increment('shares', { where: { id: postId } });

            // Lưu thông tin share
            if (userId) {
                await PostShare.create({
                    postId,
                    userId,
                    platform,
                    customMessage,
                    sharedAt: new Date()
                });
            }

            res.json({
                success: true,
                message: 'Post shared successfully'
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to share post' });
        }
    }

    // Lấy posts trending
    static async getTrendingPosts(req, res) {
        try {
            const { period = '7d', limit = 10 } = req.query;
            const days = parseInt(period.replace('d', ''));
            const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

            const trendingPosts = await Post.findAll({
                where: {
                    status: 'published',
                    createdAt: { [Op.gte]: startDate }
                },
                attributes: [
                    'id', 'title', 'slug', 'excerpt', 'featuredImage', 
                    'views', 'likes', 'shares', 'createdAt',
                    // Tính trending score
                    [
                        sequelize.literal('(views * 0.3 + likes * 0.5 + shares * 0.2)'),
                        'trendingScore'
                    ]
                ],
                include: [
                    { model: User, as: 'author', attributes: ['id', 'name'] },
                    { model: Category, attributes: ['id', 'name'] }
                ],
                order: [['trendingScore', 'DESC']],
                limit: parseInt(limit)
            });

            res.json({
                success: true,
                posts: trendingPosts,
                period
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to get trending posts' });
        }
    }

    // Lấy posts theo reading list cá nhân
    static async getReadingList(req, res) {
        try {
            const userId = req.user.id;
            const { status = 'unread', page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            // Lấy từ reading list (bookmarks + posts đã like)
            const readingList = await PostBookmark.findAndCountAll({
                where: { userId },
                include: [{
                    model: Post,
                    where: { status: 'published' },
                    include: [
                        { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] },
                        { model: Category, attributes: ['id', 'name'] }
                    ]
                }],
                limit: parseInt(limit),
                offset,
                order: [['createdAt', 'DESC']]
            });

            res.json({
                success: true,
                readingList: readingList.rows,
                pagination: {
                    total: readingList.count,
                    page: parseInt(page),
                    pages: Math.ceil(readingList.count / limit)
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to get reading list' });
        }
    }

    // Tìm kiếm posts nâng cao
    static async advancedSearch(req, res) {
        try {
            const {
                q,
                category,
                tags,
                author,
                dateFrom,
                dateTo,
                sortBy = 'relevance',
                page = 1,
                limit = 10
            } = req.query;

            const offset = (page - 1) * limit;
            const whereClause = { status: 'published' };
            const includeClause = [
                { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] },
                { model: Category, attributes: ['id', 'name'] }
            ];

            // Text search
            if (q) {
                whereClause[Op.or] = [
                    { title: { [Op.like]: `%${q}%` } },
                    { content: { [Op.like]: `%${q}%` } },
                    { excerpt: { [Op.like]: `%${q}%` } }
                ];
            }

            // Category filter
            if (category) {
                whereClause.categoryId = category;
            }

            // Tags filter
            if (tags) {
                const tagArray = Array.isArray(tags) ? tags : [tags];
                whereClause.tags = {
                    [Op.or]: tagArray.map(tag => ({ [Op.like]: `%${tag}%` }))
                };
            }

            // Author filter
            if (author) {
                includeClause[0].where = { id: author };
            }

            // Date range filter
            if (dateFrom || dateTo) {
                whereClause.createdAt = {};
                if (dateFrom) whereClause.createdAt[Op.gte] = new Date(dateFrom);
                if (dateTo) whereClause.createdAt[Op.lte] = new Date(dateTo);
            }

            // Sorting
            let orderClause;
            switch (sortBy) {
                case 'newest':
                    orderClause = [['createdAt', 'DESC']];
                    break;
                case 'oldest':
                    orderClause = [['createdAt', 'ASC']];
                    break;
                case 'popular':
                    orderClause = [['views', 'DESC']];
                    break;
                case 'trending':
                    orderClause = [[sequelize.literal('(views + likes * 2 + shares * 3)'), 'DESC']];
                    break;
                default:
                    orderClause = [['createdAt', 'DESC']];
            }

            const posts = await Post.findAndCountAll({
                where: whereClause,
                include: includeClause,
                limit: parseInt(limit),
                offset,
                order: orderClause,
                distinct: true
            });

            res.json({
                success: true,
                posts: posts.rows,
                pagination: {
                    total: posts.count,
                    page: parseInt(page),
                    pages: Math.ceil(posts.count / limit)
                },
                filters: { q, category, tags, author, dateFrom, dateTo, sortBy }
            });
        } catch (error) {
            console.error('Advanced Search Error:', error);
            res.status(500).json({ error: 'Failed to search posts' });
        }
    }

    // Helper methods
    static calculateReadingTime(content) {
        const wordsPerMinute = 200;
        const wordCount = content.split(/\s+/).length;
        return Math.ceil(wordCount / wordsPerMinute);
    }

    static async createOrUpdateTags(tags, postId) {
        for (const tagName of tags) {
            const [tag] = await Tag.findOrCreate({
                where: { name: tagName.toLowerCase() },
                defaults: { name: tagName.toLowerCase(), slug: slugify(tagName, { lower: true }) }
            });
            
            // Create post-tag relationship if not exists
            await PostTag.findOrCreate({
                where: { postId, tagId: tag.id }
            });
        }
    }

    static async incrementView(postId, userId, ip) {
        // Chỉ tăng view 1 lần per user per session
        const viewKey = userId ? `user_${userId}` : `ip_${ip}`;
        
        const existingView = await PostView.findOne({
            where: {
                postId,
                viewerKey: viewKey,
                createdAt: {
                    [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours
                }
            }
        });

        if (!existingView) {
            await PostView.create({
                postId,
                userId,
                viewerKey,
                ipAddress: ip
            });
            
            await Post.increment('views', { where: { id: postId } });
        }
    }

    static async getRelatedPosts(postId, categoryId, tags) {
        const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
        
        return await Post.findAll({
            where: {
                id: { [Op.ne]: postId },
                status: 'published',
                [Op.or]: [
                    { categoryId },
                    ...(tagArray.length > 0 ? tagArray.map(tag => ({
                        tags: { [Op.like]: `%${tag}%` }
                    })) : [])
                ]
            },
            attributes: ['id', 'title', 'slug', 'excerpt', 'featuredImage', 'createdAt'],
            include: [{ model: User, as: 'author', attributes: ['id', 'name'] }],
            limit: 5,
            order: [['createdAt', 'DESC']]
        });
    }

    static async getEngagementStats(postId) {
        const [likes, shares, comments, views] = await Promise.all([
            PostLike.count({ where: { postId } }),
            PostShare.count({ where: { postId } }),
            Comment.count({ where: { postId, status: 'approved' } }),
            PostView.count({ where: { postId } })
        ]);

        return { likes, shares, comments, views };
    }
}

module.exports = EnhancedPostController;