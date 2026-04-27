const { ChatMessage, ChatSession, User, Post, Category } = require('../models');
const { Op } = require('sequelize');

class EnhancedChatbotController {
    // Khởi tạo chat session
    static async initChatSession(req, res) {
        try {
            const userId = req.user?.id;
            const { initialMessage, context } = req.body;

            const session = await ChatSession.create({
                userId,
                sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                status: 'active',
                context: JSON.stringify(context || {}),
                startedAt: new Date()
            });

            // Gửi welcome message
            const welcomeMessage = await ChatMessage.create({
                sessionId: session.sessionId,
                sender: 'bot',
                message: '👋 Xin chào! Tôi là trợ lý ảo của blog. Tôi có thể giúp bạn:\n\n' +
                         '📝 Tìm kiếm bài viết\n' +
                         '💡 Gợi ý nội dung\n' +
                         '❓ Trả lời câu hỏi\n' +
                         '🎯 Hướng dẫn sử dụng\n\n' +
                         'Bạn cần tôi giúp gì?',
                messageType: 'text',
                metadata: JSON.stringify({ type: 'welcome' })
            });

            // Xử lý initial message nếu có
            if (initialMessage) {
                await EnhancedChatbotController.processUserMessage(
                    session.sessionId,
                    initialMessage,
                    userId
                );
            }

            res.json({
                success: true,
                session: {
                    sessionId: session.sessionId,
                    welcomeMessage: welcomeMessage.message
                }
            });
        } catch (error) {
            console.error('Init Chat Error:', error);
            res.status(500).json({ error: 'Failed to initialize chat' });
        }
    }

    // Gửi message
    static async sendMessage(req, res) {
        try {
            const { sessionId, message, attachments } = req.body;
            const userId = req.user?.id;

            // Lưu user message
            const userMessage = await ChatMessage.create({
                sessionId,
                userId,
                sender: 'user',
                message,
                messageType: attachments ? 'mixed' : 'text',
                attachments: JSON.stringify(attachments || [])
            });

            // Xử lý message và tạo response
            const botResponse = await EnhancedChatbotController.processUserMessage(
                sessionId,
                message,
                userId
            );

            // Update session activity
            await ChatSession.update(
                { lastActivityAt: new Date() },
                { where: { sessionId } }
            );

            res.json({
                success: true,
                userMessage,
                botResponse
            });
        } catch (error) {
            console.error('Send Message Error:', error);
            res.status(500).json({ error: 'Failed to send message' });
        }
    }

    // Xử lý message từ user
    static async processUserMessage(sessionId, message, userId) {
        try {
            // Phân tích intent của message
            const intent = await EnhancedChatbotController.detectIntent(message);
            
            let response;
            switch (intent.type) {
                case 'search':
                    response = await EnhancedChatbotController.handleSearch(intent.query);
                    break;
                
                case 'recommendation':
                    response = await EnhancedChatbotController.handleRecommendation(userId);
                    break;
                
                case 'question':
                    response = await EnhancedChatbotController.handleQuestion(message);
                    break;
                
                case 'help':
                    response = await EnhancedChatbotController.handleHelp();
                    break;
                
                case 'greeting':
                    response = await EnhancedChatbotController.handleGreeting();
                    break;
                
                default:
                    response = await EnhancedChatbotController.handleDefault(message);
            }

            // Lưu bot response
            const botMessage = await ChatMessage.create({
                sessionId,
                sender: 'bot',
                message: response.message,
                messageType: response.type || 'text',
                metadata: JSON.stringify(response.metadata || {}),
                suggestions: JSON.stringify(response.suggestions || [])
            });

            return botMessage;
        } catch (error) {
            console.error('Process Message Error:', error);
            return await ChatMessage.create({
                sessionId,
                sender: 'bot',
                message: 'Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại.',
                messageType: 'text'
            });
        }
    }

    // Lấy lịch sử chat
    static async getChatHistory(req, res) {
        try {
            const { sessionId } = req.params;
            const { page = 1, limit = 50 } = req.query;
            const offset = (page - 1) * limit;

            const messages = await ChatMessage.findAndCountAll({
                where: { sessionId },
                include: [{
                    model: User,
                    attributes: ['id', 'name', 'avatar']
                }],
                order: [['createdAt', 'ASC']],
                limit: parseInt(limit),
                offset
            });

            res.json({
                success: true,
                messages: messages.rows,
                pagination: {
                    total: messages.count,
                    page: parseInt(page),
                    pages: Math.ceil(messages.count / limit)
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to get chat history' });
        }
    }

    // Lấy danh sách sessions của user
    static async getUserSessions(req, res) {
        try {
            const userId = req.user.id;
            const { status = 'active', page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const sessions = await ChatSession.findAndCountAll({
                where: { 
                    userId,
                    ...(status && { status })
                },
                include: [{
                    model: ChatMessage,
                    as: 'messages',
                    limit: 1,
                    order: [['createdAt', 'DESC']]
                }],
                order: [['lastActivityAt', 'DESC']],
                limit: parseInt(limit),
                offset
            });

            res.json({
                success: true,
                sessions: sessions.rows,
                pagination: {
                    total: sessions.count,
                    page: parseInt(page),
                    pages: Math.ceil(sessions.count / limit)
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to get sessions' });
        }
    }

    // Đóng session
    static async closeSession(req, res) {
        try {
            const { sessionId } = req.params;
            const userId = req.user.id;

            await ChatSession.update(
                { 
                    status: 'closed',
                    endedAt: new Date()
                },
                { 
                    where: { 
                        sessionId,
                        userId
                    }
                }
            );

            res.json({
                success: true,
                message: 'Session closed successfully'
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to close session' });
        }
    }

    // Rate message (feedback)
    static async rateMessage(req, res) {
        try {
            const { messageId } = req.params;
            const { rating, feedback } = req.body; // rating: 'helpful' | 'not_helpful'

            await ChatMessage.update(
                { 
                    rating,
                    feedback,
                    ratedAt: new Date()
                },
                { where: { id: messageId } }
            );

            res.json({
                success: true,
                message: 'Thank you for your feedback!'
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to rate message' });
        }
    }

    // Helper methods
    static async detectIntent(message) {
        const lowerMessage = message.toLowerCase();

        // Search intent
        if (lowerMessage.includes('tìm') || lowerMessage.includes('search') || 
            lowerMessage.includes('bài viết') || lowerMessage.includes('article')) {
            return {
                type: 'search',
                query: message.replace(/tìm|search|bài viết về|article about/gi, '').trim()
            };
        }

        // Recommendation intent
        if (lowerMessage.includes('gợi ý') || lowerMessage.includes('recommend') ||
            lowerMessage.includes('đề xuất') || lowerMessage.includes('suggest')) {
            return { type: 'recommendation' };
        }

        // Question intent
        if (lowerMessage.includes('?') || lowerMessage.includes('làm sao') ||
            lowerMessage.includes('how to') || lowerMessage.includes('what is')) {
            return { type: 'question' };
        }

        // Help intent
        if (lowerMessage.includes('help') || lowerMessage.includes('giúp') ||
            lowerMessage.includes('hướng dẫn') || lowerMessage.includes('guide')) {
            return { type: 'help' };
        }

        // Greeting intent
        if (lowerMessage.match(/^(hi|hello|xin chào|chào|hey)/)) {
            return { type: 'greeting' };
        }

        return { type: 'default' };
    }

    static async handleSearch(query) {
        const posts = await Post.findAll({
            where: {
                status: 'published',
                [Op.or]: [
                    { title: { [Op.like]: `%${query}%` } },
                    { content: { [Op.like]: `%${query}%` } }
                ]
            },
            include: [
                { model: User, as: 'author', attributes: ['id', 'name'] },
                { model: Category, attributes: ['id', 'name'] }
            ],
            limit: 5
        });

        if (posts.length === 0) {
            return {
                message: `Không tìm thấy bài viết nào về "${query}". Bạn có thể thử tìm kiếm với từ khóa khác?`,
                suggestions: ['Xem bài viết trending', 'Gợi ý cho tôi', 'Danh mục bài viết']
            };
        }

        const postList = posts.map((post, index) => 
            `${index + 1}. **${post.title}**\n   👤 ${post.author.name} | 📁 ${post.category.name}\n   🔗 /posts/${post.slug}`
        ).join('\n\n');

        return {
            message: `Tôi tìm thấy ${posts.length} bài viết về "${query}":\n\n${postList}`,
            type: 'rich',
            metadata: { posts: posts.map(p => ({ id: p.id, title: p.title, slug: p.slug })) },
            suggestions: ['Tìm kiếm khác', 'Gợi ý thêm']
        };
    }

    static async handleRecommendation(userId) {
        // Lấy bài viết trending
        const trendingPosts = await Post.findAll({
            where: { status: 'published' },
            order: [
                [sequelize.literal('(views + likes * 2 + shares * 3)'), 'DESC']
            ],
            include: [
                { model: User, as: 'author', attributes: ['id', 'name'] },
                { model: Category, attributes: ['id', 'name'] }
            ],
            limit: 5
        });

        const postList = trendingPosts.map((post, index) => 
            `${index + 1}. **${post.title}**\n   👤 ${post.author.name} | 👁️ ${post.views} views\n   🔗 /posts/${post.slug}`
        ).join('\n\n');

        return {
            message: `📈 Đây là những bài viết đang trending:\n\n${postList}`,
            type: 'rich',
            metadata: { posts: trendingPosts.map(p => ({ id: p.id, title: p.title, slug: p.slug })) },
            suggestions: ['Xem thêm', 'Tìm kiếm bài viết', 'Danh mục']
        };
    }

    static async handleQuestion(question) {
        // Simulate AI response (có thể tích hợp với OpenAI API)
        const faqs = {
            'đăng bài': 'Để đăng bài, bạn cần đăng nhập và vào mục "Tạo bài viết" trên menu. Điền đầy đủ thông tin và nhấn "Xuất bản".',
            'comment': 'Bạn có thể comment bằng cách vào bài viết và nhập nội dung vào ô comment ở cuối trang.',
            'bookmark': 'Để bookmark bài viết, nhấn vào icon 🔖 trên bài viết. Bạn có thể xem lại trong mục "Bookmarks" của profile.',
            'profile': 'Để chỉnh sửa profile, vào menu và chọn "Profile" > "Edit Profile".'
        };

        for (const [key, answer] of Object.entries(faqs)) {
            if (question.toLowerCase().includes(key)) {
                return {
                    message: `💡 ${answer}`,
                    suggestions: ['Câu hỏi khác', 'Hướng dẫn chi tiết']
                };
            }
        }

        return {
            message: 'Tôi chưa hiểu rõ câu hỏi của bạn. Bạn có thể diễn đạt lại hoặc xem phần "Hướng dẫn" để biết thêm chi tiết.',
            suggestions: ['Hướng dẫn sử dụng', 'FAQ', 'Liên hệ support']
        };
    }

    static async handleHelp() {
        return {
            message: '📚 **Hướng dẫn sử dụng:**\n\n' +
                     '1️⃣ **Tìm kiếm bài viết**: Gõ "tìm [từ khóa]"\n' +
                     '2️⃣ **Gợi ý bài viết**: Gõ "gợi ý cho tôi"\n' +
                     '3️⃣ **Đặt câu hỏi**: Gõ câu hỏi của bạn\n' +
                     '4️⃣ **Xem danh mục**: Gõ "danh mục"\n' +
                     '5️⃣ **Trending**: Gõ "trending"\n\n' +
                     'Bạn cần giúp gì khác?',
            suggestions: ['Tìm kiếm', 'Gợi ý', 'Trending', 'Danh mục']
        };
    }

    static async handleGreeting() {
        const greetings = [
            '👋 Xin chào! Tôi có thể giúp gì cho bạn?',
            '😊 Chào bạn! Bạn cần tìm bài viết gì không?',
            '🎉 Hello! Có gì tôi có thể hỗ trợ?'
        ];

        return {
            message: greetings[Math.floor(Math.random() * greetings.length)],
            suggestions: ['Tìm kiếm bài viết', 'Gợi ý cho tôi', 'Hướng dẫn']
        };
    }

    static async handleDefault(message) {
        return {
            message: 'Tôi không chắc tôi hiểu ý bạn. Bạn có thể:\n\n' +
                     '🔍 Tìm kiếm bài viết\n' +
                     '💡 Nhận gợi ý\n' +
                     '❓ Đặt câu hỏi\n' +
                     '📚 Xem hướng dẫn',
            suggestions: ['Tìm kiếm', 'Gợi ý', 'Hướng dẫn', 'Help']
        };
    }
}

module.exports = EnhancedChatbotController;