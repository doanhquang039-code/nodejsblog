const { Post, User, Comment, Activity, sequelize } = require('../models');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');
const puppeteer = require('puppeteer');

class AdvancedAnalyticsController {
    // Dashboard tổng quan với real-time data
    static async getRealtimeDashboard(req, res) {
        try {
            const now = new Date();
            const last24Hours = new Date(now - 24 * 60 * 60 * 1000);
            const last7Days = new Date(now - 7 * 24 * 60 * 60 * 1000);
            const last30Days = new Date(now - 30 * 24 * 60 * 60 * 1000);

            const [
                totalPosts,
                totalUsers,
                totalComments,
                postsLast24h,
                usersLast24h,
                commentsLast24h,
                topPosts,
                userGrowth,
                contentPerformance
            ] = await Promise.all([
                Post.count(),
                User.count(),
                Comment.count(),
                Post.count({ where: { createdAt: { [Op.gte]: last24Hours } } }),
                User.count({ where: { createdAt: { [Op.gte]: last24Hours } } }),
                Comment.count({ where: { createdAt: { [Op.gte]: last24Hours } } }),
                AdvancedAnalyticsController.getTopPerformingPosts(7),
                AdvancedAnalyticsController.getUserGrowthData(30),
                AdvancedAnalyticsController.getContentPerformance(30)
            ]);

            const dashboard = {
                overview: {
                    totalPosts,
                    totalUsers,
                    totalComments,
                    postsLast24h,
                    usersLast24h,
                    commentsLast24h
                },
                topPosts,
                userGrowth,
                contentPerformance,
                lastUpdated: now
            };

            res.json({
                success: true,
                dashboard
            });
        } catch (error) {
            console.error('Dashboard Error:', error);
            res.status(500).json({ error: 'Failed to load dashboard' });
        }
    }

    // Phân tích hành vi người dùng
    static async getUserBehaviorAnalysis(req, res) {
        try {
            const { days = 30 } = req.query;
            const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

            const behaviorData = await sequelize.query(`
                SELECT 
                    DATE(createdAt) as date,
                    activityType,
                    COUNT(*) as count
                FROM Activities 
                WHERE createdAt >= :startDate
                GROUP BY DATE(createdAt), activityType
                ORDER BY date DESC
            `, {
                replacements: { startDate },
                type: sequelize.QueryTypes.SELECT
            });

            const sessionData = await AdvancedAnalyticsController.getSessionAnalysis(days);
            const engagementMetrics = await AdvancedAnalyticsController.getEngagementMetrics(days);

            res.json({
                success: true,
                analysis: {
                    behaviorData,
                    sessionData,
                    engagementMetrics
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to analyze user behavior' });
        }
    }

    // Báo cáo chi tiết theo khoảng thời gian
    static async generateDetailedReport(req, res) {
        try {
            const { startDate, endDate, format = 'json' } = req.query;
            
            const reportData = await AdvancedAnalyticsController.getReportData(startDate, endDate);

            if (format === 'excel') {
                const excelBuffer = await AdvancedAnalyticsController.generateExcelReport(reportData);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', 'attachment; filename=blog-report.xlsx');
                return res.send(excelBuffer);
            }

            if (format === 'pdf') {
                const pdfBuffer = await AdvancedAnalyticsController.generatePDFReport(reportData);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename=blog-report.pdf');
                return res.send(pdfBuffer);
            }

            res.json({
                success: true,
                report: reportData
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to generate report' });
        }
    }

    // Phân tích SEO performance
    static async getSEOAnalysis(req, res) {
        try {
            const posts = await Post.findAll({
                attributes: ['id', 'title', 'slug', 'content', 'views', 'createdAt'],
                order: [['views', 'DESC']],
                limit: 100
            });

            const seoAnalysis = posts.map(post => {
                const analysis = AdvancedAnalyticsController.analyzeSEO(post);
                return {
                    id: post.id,
                    title: post.title,
                    slug: post.slug,
                    views: post.views,
                    seoScore: analysis.score,
                    issues: analysis.issues,
                    recommendations: analysis.recommendations
                };
            });

            const overallSEO = {
                averageScore: seoAnalysis.reduce((sum, post) => sum + post.seoScore, 0) / seoAnalysis.length,
                topPerformers: seoAnalysis.slice(0, 10),
                needsImprovement: seoAnalysis.filter(post => post.seoScore < 70)
            };

            res.json({
                success: true,
                seoAnalysis: overallSEO
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to analyze SEO' });
        }
    }

    // Dự đoán xu hướng
    static async getTrendPrediction(req, res) {
        try {
            const { category, days = 30 } = req.query;
            
            const historicalData = await AdvancedAnalyticsController.getHistoricalTrends(category, days);
            const prediction = AdvancedAnalyticsController.predictTrends(historicalData);

            res.json({
                success: true,
                prediction: {
                    category,
                    historicalData,
                    predictedTrend: prediction.trend,
                    confidence: prediction.confidence,
                    recommendations: prediction.recommendations
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to predict trends' });
        }
    }

    // Helper methods
    static async getTopPerformingPosts(days) {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        
        return await Post.findAll({
            where: { createdAt: { [Op.gte]: startDate } },
            attributes: ['id', 'title', 'views', 'likes', 'createdAt'],
            order: [['views', 'DESC']],
            limit: 10
        });
    }

    static async getUserGrowthData(days) {
        const result = await sequelize.query(`
            SELECT 
                DATE(createdAt) as date,
                COUNT(*) as newUsers
            FROM Users 
            WHERE createdAt >= DATE_SUB(NOW(), INTERVAL :days DAY)
            GROUP BY DATE(createdAt)
            ORDER BY date
        `, {
            replacements: { days },
            type: sequelize.QueryTypes.SELECT
        });

        return result;
    }

    static async getContentPerformance(days) {
        return await sequelize.query(`
            SELECT 
                c.name as category,
                COUNT(p.id) as postCount,
                AVG(p.views) as avgViews,
                AVG(p.likes) as avgLikes
            FROM Posts p
            LEFT JOIN Categories c ON p.categoryId = c.id
            WHERE p.createdAt >= DATE_SUB(NOW(), INTERVAL :days DAY)
            GROUP BY c.id, c.name
            ORDER BY avgViews DESC
        `, {
            replacements: { days },
            type: sequelize.QueryTypes.SELECT
        });
    }

    static async getSessionAnalysis(days) {
        // Simulate session analysis
        return {
            averageSessionDuration: '5:30',
            bounceRate: '35%',
            pagesPerSession: 3.2,
            returnVisitorRate: '45%'
        };
    }

    static async getEngagementMetrics(days) {
        return {
            commentRate: '12%',
            shareRate: '8%',
            likeRate: '25%',
            subscriptionRate: '3%'
        };
    }

    static async getReportData(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const [posts, users, comments, activities] = await Promise.all([
            Post.findAll({ where: { createdAt: { [Op.between]: [start, end] } } }),
            User.findAll({ where: { createdAt: { [Op.between]: [start, end] } } }),
            Comment.findAll({ where: { createdAt: { [Op.between]: [start, end] } } }),
            Activity.findAll({ where: { createdAt: { [Op.between]: [start, end] } } })
        ]);

        return {
            period: { startDate, endDate },
            summary: {
                totalPosts: posts.length,
                totalUsers: users.length,
                totalComments: comments.length,
                totalActivities: activities.length
            },
            posts,
            users,
            comments,
            activities
        };
    }

    static async generateExcelReport(data) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Blog Report');

        // Add headers
        worksheet.addRow(['Metric', 'Value']);
        worksheet.addRow(['Total Posts', data.summary.totalPosts]);
        worksheet.addRow(['Total Users', data.summary.totalUsers]);
        worksheet.addRow(['Total Comments', data.summary.totalComments]);

        return await workbook.xlsx.writeBuffer();
    }

    static async generatePDFReport(data) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        const html = `
            <html>
                <body>
                    <h1>Blog Analytics Report</h1>
                    <p>Period: ${data.period.startDate} to ${data.period.endDate}</p>
                    <h2>Summary</h2>
                    <ul>
                        <li>Total Posts: ${data.summary.totalPosts}</li>
                        <li>Total Users: ${data.summary.totalUsers}</li>
                        <li>Total Comments: ${data.summary.totalComments}</li>
                    </ul>
                </body>
            </html>
        `;

        await page.setContent(html);
        const pdf = await page.pdf({ format: 'A4' });
        await browser.close();

        return pdf;
    }

    static analyzeSEO(post) {
        let score = 100;
        const issues = [];
        const recommendations = [];

        // Check title length
        if (post.title.length < 30 || post.title.length > 60) {
            score -= 10;
            issues.push('Title length not optimal');
            recommendations.push('Keep title between 30-60 characters');
        }

        // Check content length
        if (post.content.length < 300) {
            score -= 15;
            issues.push('Content too short');
            recommendations.push('Add more content (minimum 300 words)');
        }

        return { score, issues, recommendations };
    }

    static async getHistoricalTrends(category, days) {
        // Simulate historical trend data
        const data = [];
        for (let i = days; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            data.push({
                date: date.toISOString().split('T')[0],
                views: Math.floor(Math.random() * 1000) + 500,
                posts: Math.floor(Math.random() * 10) + 1
            });
        }
        return data;
    }

    static predictTrends(historicalData) {
        // Simple trend prediction algorithm
        const recentViews = historicalData.slice(-7).map(d => d.views);
        const avgRecent = recentViews.reduce((a, b) => a + b, 0) / recentViews.length;
        const olderViews = historicalData.slice(0, 7).map(d => d.views);
        const avgOlder = olderViews.reduce((a, b) => a + b, 0) / olderViews.length;

        const trend = avgRecent > avgOlder ? 'increasing' : 'decreasing';
        const confidence = Math.abs(avgRecent - avgOlder) / avgOlder;

        return {
            trend,
            confidence: Math.min(confidence * 100, 95),
            recommendations: trend === 'increasing' 
                ? ['Continue current content strategy', 'Increase posting frequency']
                : ['Review content quality', 'Analyze competitor strategies']
        };
    }
}

module.exports = AdvancedAnalyticsController;