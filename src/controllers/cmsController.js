const { Post, Category, Tag, User, Media, Template } = require('../models');
const { Op } = require('sequelize');
const slugify = require('slugify');
const fs = require('fs').promises;
const path = require('path');

class CMSController {
    // Bulk operations cho posts
    static async bulkOperations(req, res) {
        try {
            const { action, postIds, data } = req.body;

            switch (action) {
                case 'publish':
                    await Post.update(
                        { status: 'published', publishedAt: new Date() },
                        { where: { id: { [Op.in]: postIds } } }
                    );
                    break;

                case 'unpublish':
                    await Post.update(
                        { status: 'draft' },
                        { where: { id: { [Op.in]: postIds } } }
                    );
                    break;

                case 'delete':
                    await Post.destroy({ where: { id: { [Op.in]: postIds } } });
                    break;

                case 'updateCategory':
                    await Post.update(
                        { categoryId: data.categoryId },
                        { where: { id: { [Op.in]: postIds } } }
                    );
                    break;

                case 'addTags':
                    for (const postId of postIds) {
                        const post = await Post.findByPk(postId);
                        if (post) {
                            const existingTags = post.tags ? post.tags.split(',') : [];
                            const newTags = [...new Set([...existingTags, ...data.tags])];
                            await post.update({ tags: newTags.join(',') });
                        }
                    }
                    break;

                default:
                    return res.status(400).json({ error: 'Invalid action' });
            }

            res.json({
                success: true,
                message: `Bulk ${action} completed for ${postIds.length} posts`
            });
        } catch (error) {
            console.error('Bulk Operation Error:', error);
            res.status(500).json({ error: 'Bulk operation failed' });
        }
    }

    // Template management
    static async createTemplate(req, res) {
        try {
            const { name, description, content, type, variables } = req.body;
            const userId = req.user.id;

            const template = await Template.create({
                name,
                description,
                content,
                type, // 'post', 'page', 'email'
                variables: JSON.stringify(variables || []),
                createdBy: userId,
                isActive: true
            });

            res.json({
                success: true,
                template
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to create template' });
        }
    }

    // Lấy danh sách templates
    static async getTemplates(req, res) {
        try {
            const { type, page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const whereClause = { isActive: true };
            if (type) whereClause.type = type;

            const templates = await Template.findAndCountAll({
                where: whereClause,
                include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }],
                limit: parseInt(limit),
                offset,
                order: [['createdAt', 'DESC']]
            });

            res.json({
                success: true,
                templates: templates.rows,
                pagination: {
                    total: templates.count,
                    page: parseInt(page),
                    pages: Math.ceil(templates.count / limit)
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to get templates' });
        }
    }

    // Tạo post từ template
    static async createFromTemplate(req, res) {
        try {
            const { templateId, variables, title } = req.body;
            const userId = req.user.id;

            const template = await Template.findByPk(templateId);
            if (!template) {
                return res.status(404).json({ error: 'Template not found' });
            }

            // Replace variables in template content
            let content = template.content;
            const templateVariables = JSON.parse(template.variables || '[]');
            
            templateVariables.forEach(variable => {
                const value = variables[variable.name] || variable.defaultValue || '';
                content = content.replace(new RegExp(`{{${variable.name}}}`, 'g'), value);
            });

            const post = await Post.create({
                title: title || `New Post from ${template.name}`,
                content,
                slug: slugify(title || `new-post-${Date.now()}`, { lower: true }),
                authorId: userId,
                status: 'draft',
                templateId
            });

            res.json({
                success: true,
                post
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to create post from template' });
        }
    }

    // Media library management
    static async getMediaLibrary(req, res) {
        try {
            const { type, page = 1, limit = 20, search } = req.query;
            const offset = (page - 1) * limit;

            const whereClause = {};
            if (type) whereClause.type = type;
            if (search) {
                whereClause[Op.or] = [
                    { filename: { [Op.like]: `%${search}%` } },
                    { altText: { [Op.like]: `%${search}%` } }
                ];
            }

            const media = await Media.findAndCountAll({
                where: whereClause,
                limit: parseInt(limit),
                offset,
                order: [['createdAt', 'DESC']]
            });

            res.json({
                success: true,
                media: media.rows,
                pagination: {
                    total: media.count,
                    page: parseInt(page),
                    pages: Math.ceil(media.count / limit)
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to get media library' });
        }
    }

    // Content versioning
    static async createVersion(req, res) {
        try {
            const { postId } = req.params;
            const { reason } = req.body;
            const userId = req.user.id;

            const post = await Post.findByPk(postId);
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            // Create version snapshot
            const version = await PostVersion.create({
                postId,
                title: post.title,
                content: post.content,
                excerpt: post.excerpt,
                version: await CMSController.getNextVersionNumber(postId),
                reason,
                createdBy: userId
            });

            res.json({
                success: true,
                version
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to create version' });
        }
    }

    // Workflow management
    static async submitForReview(req, res) {
        try {
            const { postId } = req.params;
            const { reviewerId, notes } = req.body;
            const userId = req.user.id;

            await Post.update(
                { 
                    status: 'pending_review',
                    reviewerId,
                    submittedAt: new Date()
                },
                { where: { id: postId } }
            );

            // Create workflow entry
            await WorkflowEntry.create({
                postId,
                fromStatus: 'draft',
                toStatus: 'pending_review',
                userId,
                reviewerId,
                notes
            });

            res.json({
                success: true,
                message: 'Post submitted for review'
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to submit for review' });
        }
    }

    // Content analytics
    static async getContentAnalytics(req, res) {
        try {
            const { period = '30d' } = req.query;
            const days = parseInt(period.replace('d', ''));
            const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

            const analytics = await CMSController.calculateContentMetrics(startDate);

            res.json({
                success: true,
                analytics
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to get content analytics' });
        }
    }

    // Content optimization suggestions
    static async getOptimizationSuggestions(req, res) {
        try {
            const { postId } = req.params;
            const post = await Post.findByPk(postId);

            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            const suggestions = CMSController.analyzeContent(post);

            res.json({
                success: true,
                suggestions
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to get optimization suggestions' });
        }
    }

    // Helper methods
    static async getNextVersionNumber(postId) {
        const lastVersion = await PostVersion.findOne({
            where: { postId },
            order: [['version', 'DESC']]
        });
        return lastVersion ? lastVersion.version + 1 : 1;
    }

    static async calculateContentMetrics(startDate) {
        const posts = await Post.findAll({
            where: { createdAt: { [Op.gte]: startDate } },
            attributes: ['id', 'views', 'likes', 'createdAt', 'status']
        });

        return {
            totalPosts: posts.length,
            publishedPosts: posts.filter(p => p.status === 'published').length,
            draftPosts: posts.filter(p => p.status === 'draft').length,
            totalViews: posts.reduce((sum, p) => sum + (p.views || 0), 0),
            totalLikes: posts.reduce((sum, p) => sum + (p.likes || 0), 0),
            avgViewsPerPost: posts.length > 0 ? posts.reduce((sum, p) => sum + (p.views || 0), 0) / posts.length : 0
        };
    }

    static analyzeContent(post) {
        const suggestions = [];
        const content = post.content || '';
        const title = post.title || '';

        // Content length analysis
        if (content.length < 300) {
            suggestions.push({
                type: 'content_length',
                priority: 'high',
                message: 'Content is too short. Consider adding more detailed information.',
                recommendation: 'Aim for at least 300 words for better SEO performance.'
            });
        }

        // Title analysis
        if (title.length < 30) {
            suggestions.push({
                type: 'title_length',
                priority: 'medium',
                message: 'Title is too short for optimal SEO.',
                recommendation: 'Consider expanding the title to 30-60 characters.'
            });
        }

        // Image analysis
        const imageCount = (content.match(/<img/g) || []).length;
        if (imageCount === 0) {
            suggestions.push({
                type: 'images',
                priority: 'medium',
                message: 'No images found in content.',
                recommendation: 'Add relevant images to improve engagement.'
            });
        }

        // Heading structure
        const headingCount = (content.match(/<h[1-6]/g) || []).length;
        if (headingCount < 2) {
            suggestions.push({
                type: 'headings',
                priority: 'medium',
                message: 'Limited heading structure.',
                recommendation: 'Use H2, H3 tags to improve content structure.'
            });
        }

        return suggestions;
    }
}

module.exports = CMSController;