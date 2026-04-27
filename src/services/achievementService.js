// ============================================
// ACHIEVEMENT SERVICE
// ============================================

const db = require('../models');
const { Op } = require('sequelize');

class AchievementService {
    /**
     * Get all achievements
     */
    static async getAllAchievements() {
        return await db.Achievement.findAll({
            where: { is_active: true },
            order: [['category', 'ASC'], ['points', 'ASC']]
        });
    }

    /**
     * Get user achievements
     */
    static async getUserAchievements(userId) {
        const achievements = await db.Achievement.findAll({
            where: { is_active: true },
            include: [
                {
                    model: db.UserAchievement,
                    as: 'userProgress',
                    where: { user_id: userId },
                    required: false
                }
            ],
            order: [['category', 'ASC'], ['points', 'ASC']]
        });

        return achievements.map(achievement => ({
            ...achievement.toJSON(),
            progress: achievement.userProgress?.[0]?.progress || 0,
            is_completed: achievement.userProgress?.[0]?.is_completed || false,
            completed_at: achievement.userProgress?.[0]?.completed_at || null
        }));
    }

    /**
     * Check and unlock achievements
     */
    static async checkAchievements(userId) {
        const achievements = await db.Achievement.findAll({
            where: { is_active: true }
        });

        const unlockedAchievements = [];

        for (const achievement of achievements) {
            const isUnlocked = await this.checkAchievementProgress(userId, achievement);
            
            if (isUnlocked) {
                unlockedAchievements.push(achievement);
                
                // Send notification
                const RealtimeNotificationService = require('./realtimeNotificationService');
                await RealtimeNotificationService.notifyAchievement(userId, achievement.id);
            }
        }

        return unlockedAchievements;
    }

    /**
     * Check single achievement progress
     */
    static async checkAchievementProgress(userId, achievement) {
        let progress = 0;
        let isCompleted = false;

        switch (achievement.requirement_type) {
            case 'count':
                progress = await this.getCountProgress(userId, achievement);
                break;
            case 'streak':
                progress = await this.getStreakProgress(userId, achievement);
                break;
            case 'quality':
                progress = await this.getQualityProgress(userId, achievement);
                break;
            case 'special':
                progress = await this.getSpecialProgress(userId, achievement);
                break;
        }

        if (progress >= achievement.requirement_value) {
            isCompleted = true;
        }

        // Update or create user achievement
        const [userAchievement, created] = await db.UserAchievement.findOrCreate({
            where: {
                user_id: userId,
                achievement_id: achievement.id
            },
            defaults: {
                progress,
                is_completed: isCompleted,
                completed_at: isCompleted ? new Date() : null
            }
        });

        if (!created && !userAchievement.is_completed && isCompleted) {
            await userAchievement.update({
                progress,
                is_completed: true,
                completed_at: new Date()
            });

            // Award points
            await this.awardPoints(userId, achievement.points, 'achievement_unlocked', achievement.name);

            return true; // Newly unlocked
        } else if (!created) {
            await userAchievement.update({ progress });
        }

        return false;
    }

    /**
     * Get count-based progress
     */
    static async getCountProgress(userId, achievement) {
        switch (achievement.category) {
            case 'posts':
                return await db.Post.count({ where: { user_id: userId } });
            case 'engagement':
                if (achievement.name.includes('Comment')) {
                    return await db.Comment.count({ where: { user_id: userId } });
                }
                // Add more engagement metrics
                return 0;
            case 'social':
                if (achievement.name.includes('follower')) {
                    return await db.UserFollower.count({ where: { following_id: userId } });
                }
                return 0;
            default:
                return 0;
        }
    }

    /**
     * Get streak progress
     */
    static async getStreakProgress(userId, achievement) {
        // Calculate posting streak
        const posts = await db.Post.findAll({
            where: { user_id: userId },
            attributes: ['created_at'],
            order: [['created_at', 'DESC']],
            limit: 30
        });

        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        for (const post of posts) {
            const postDate = new Date(post.created_at);
            postDate.setHours(0, 0, 0, 0);

            const diffDays = Math.floor((currentDate - postDate) / (1000 * 60 * 60 * 24));

            if (diffDays === streak) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }

        return streak;
    }

    /**
     * Get quality progress
     */
    static async getQualityProgress(userId, achievement) {
        // Implement quality metrics (likes, views, etc.)
        return 0;
    }

    /**
     * Get special progress
     */
    static async getSpecialProgress(userId, achievement) {
        // Special achievements (early adopter, etc.)
        if (achievement.name === 'Early Adopter') {
            const user = await db.User.findByPk(userId);
            const accountAge = (new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24);
            return accountAge <= 30 ? 1 : 0;
        }
        return 0;
    }

    /**
     * Award points
     */
    static async awardPoints(userId, points, actionType, description) {
        // Get or create user points
        let [userPoints] = await db.UserPoint.findOrCreate({
            where: { user_id: userId },
            defaults: {
                total_points: 0,
                level: 1,
                experience: 0
            }
        });

        // Update points
        const newTotalPoints = userPoints.total_points + points;
        const newLevel = Math.floor(newTotalPoints / 100) + 1;

        await userPoints.update({
            total_points: newTotalPoints,
            level: newLevel,
            experience: newTotalPoints,
            weekly_points: userPoints.weekly_points + points,
            monthly_points: userPoints.monthly_points + points,
            last_activity_at: new Date()
        });

        // Log transaction
        await db.PointTransaction.create({
            user_id: userId,
            points,
            action_type: actionType,
            description
        });

        return userPoints;
    }

    /**
     * Get leaderboard
     */
    static async getLeaderboard(options = {}) {
        const { limit = 50, period = 'all' } = options;

        let orderField = 'total_points';
        if (period === 'weekly') orderField = 'weekly_points';
        if (period === 'monthly') orderField = 'monthly_points';

        const leaderboard = await db.UserPoint.findAll({
            include: [
                {
                    model: db.User,
                    as: 'user',
                    attributes: ['id', 'username', 'name', 'avatar']
                }
            ],
            order: [[orderField, 'DESC']],
            limit
        });

        return leaderboard.map((entry, index) => ({
            rank: index + 1,
            ...entry.toJSON()
        }));
    }

    /**
     * Get user stats
     */
    static async getUserStats(userId) {
        const userPoints = await db.UserPoint.findOne({
            where: { user_id: userId }
        });

        const achievements = await db.UserAchievement.count({
            where: {
                user_id: userId,
                is_completed: true
            }
        });

        const rank = await db.UserPoint.count({
            where: {
                total_points: {
                    [Op.gt]: userPoints?.total_points || 0
                }
            }
        }) + 1;

        return {
            total_points: userPoints?.total_points || 0,
            level: userPoints?.level || 1,
            experience: userPoints?.experience || 0,
            weekly_points: userPoints?.weekly_points || 0,
            monthly_points: userPoints?.monthly_points || 0,
            achievements_unlocked: achievements,
            global_rank: rank
        };
    }
}

module.exports = AchievementService;
