const axios = require('axios');
const { Post, Category, Tag } = require('../models');

class AIController {
    // Tạo nội dung bài viết bằng AI
    static async generateContent(req, res) {
        try {
            const { topic, category, tone = 'professional', length = 'medium' } = req.body;
            
            if (!topic) {
                return res.status(400).json({ error: 'Topic is required' });
            }

            // Simulate AI content generation (có thể tích hợp với OpenAI API)
            const generatedContent = await AIController.simulateAIGeneration(topic, tone, length);
            
            res.json({
                success: true,
                content: generatedContent,
                metadata: {
                    topic,
                    tone,
                    length,
                    wordCount: generatedContent.content.split(' ').length,
                    readingTime: Math.ceil(generatedContent.content.split(' ').length / 200)
                }
            });
        } catch (error) {
            console.error('AI Generation Error:', error);
            res.status(500).json({ error: 'Failed to generate content' });
        }
    }

    // Tạo tiêu đề SEO
    static async generateSEOTitle(req, res) {
        try {
            const { content, keywords } = req.body;
            
            const seoTitles = [
                `${keywords[0]} - Complete Guide 2024`,
                `How to ${keywords[0]}: Expert Tips & Tricks`,
                `${keywords[0]} Tutorial: Step-by-Step Guide`,
                `Master ${keywords[0]} in 2024: Ultimate Guide`,
                `${keywords[0]} Best Practices & Examples`
            ];

            res.json({
                success: true,
                suggestions: seoTitles,
                recommended: seoTitles[0]
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to generate SEO titles' });
        }
    }

    // Tạo tags tự động
    static async generateTags(req, res) {
        try {
            const { content, title } = req.body;
            
            // Simulate tag extraction from content
            const extractedTags = AIController.extractTags(content + ' ' + title);
            
            res.json({
                success: true,
                tags: extractedTags,
                confidence: 0.85
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to generate tags' });
        }
    }

    // Tối ưu hóa nội dung cho SEO
    static async optimizeForSEO(req, res) {
        try {
            const { content, targetKeyword } = req.body;
            
            const optimization = {
                keywordDensity: AIController.calculateKeywordDensity(content, targetKeyword),
                suggestions: [
                    'Add more internal links',
                    'Include target keyword in first paragraph',
                    'Add meta description',
                    'Optimize image alt texts'
                ],
                score: 75,
                improvements: {
                    title: `Include "${targetKeyword}" in title`,
                    headings: 'Use H2, H3 tags with keywords',
                    content: 'Increase keyword density to 1-2%'
                }
            };

            res.json({
                success: true,
                optimization
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to optimize content' });
        }
    }

    // Helper methods
    static async simulateAIGeneration(topic, tone, length) {
        const templates = {
            professional: {
                intro: `In today's digital landscape, understanding ${topic} has become increasingly important.`,
                body: `This comprehensive guide will explore the key aspects of ${topic}, providing you with actionable insights and practical strategies.`,
                conclusion: `By implementing these ${topic} strategies, you'll be well-positioned for success.`
            },
            casual: {
                intro: `Hey there! Let's dive into the world of ${topic} and see what all the fuss is about.`,
                body: `So, ${topic} is pretty cool, and here's why you should care about it...`,
                conclusion: `That's a wrap on ${topic}! Hope this helps you out.`
            }
        };

        const template = templates[tone] || templates.professional;
        
        return {
            title: `Ultimate Guide to ${topic}`,
            content: `${template.intro}\n\n${template.body}\n\n${template.conclusion}`,
            excerpt: `Learn everything about ${topic} in this comprehensive guide.`,
            suggestedTags: AIController.extractTags(topic)
        };
    }

    static extractTags(text) {
        const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3 && !commonWords.includes(word));
        
        return [...new Set(words)].slice(0, 5);
    }

    static calculateKeywordDensity(content, keyword) {
        const words = content.toLowerCase().split(/\s+/);
        const keywordCount = words.filter(word => word.includes(keyword.toLowerCase())).length;
        return ((keywordCount / words.length) * 100).toFixed(2);
    }
}

module.exports = AIController;