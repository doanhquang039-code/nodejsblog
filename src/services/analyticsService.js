const { Post, Comment, PostAnalytics, sequelize } = require("../models");
const { Op } = require("sequelize");

class AnalyticsService {
  // Get dashboard overview
  async getDashboardOverview() {
    const totalPosts = await Post.count({ where: { status: "approved" } });
    const totalComments = await Comment.count();
    const totalViews = await PostAnalytics.sum("view_count");
    const totalLikes = await PostAnalytics.sum("like_count");

    // Last 7 days stats
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const postsCreatedWeek = await Post.count({
      where: {
        createdAt: { [Op.gte]: sevenDaysAgo },
        status: "approved",
      },
    });

    const commentsWeek = await Comment.count({
      where: { createdAt: { [Op.gte]: sevenDaysAgo } },
    });

    return {
      totalPosts,
      totalComments,
      totalViews: totalViews || 0,
      totalLikes: totalLikes || 0,
      postsCreatedWeek,
      commentsWeek,
    };
  }

  // Get post analytics
  async getPostAnalytics(postId) {
    return await PostAnalytics.findOne({
      where: { post_id: postId },
      include: [
        {
          model: Post,
          attributes: ["id", "title", "slug", "createdAt"],
        },
      ],
    });
  }

  // Get detailed analytics for period
  async getAnalyticsReport(startDate, endDate) {
    const posts = await Post.findAll({
      where: {
        createdAt: { [Op.between]: [startDate, endDate] },
        status: "approved",
      },
      include: [
        {
          association: "stats",
          attributes: ["view_count", "like_count"],
        },
      ],
      order: [[sequelize.col("stats.view_count"), "DESC"]],
    });

    const totalViews = posts.reduce(
      (sum, p) => sum + (p.stats?.view_count || 0),
      0
    );
    const totalLikes = posts.reduce(
      (sum, p) => sum + (p.stats?.like_count || 0),
      0
    );
    const avgViews = posts.length > 0 ? Math.round(totalViews / posts.length) : 0;

    return {
      period: { startDate, endDate },
      totalPosts: posts.length,
      totalViews,
      totalLikes,
      avgViews,
      topPosts: posts.slice(0, 10),
    };
  }

  // Get user analytics
  async getUserAnalytics(userId) {
    const posts = await Post.count({
      where: { user_id: userId, status: "approved" },
    });

    const comments = await Comment.count({
      where: { user_id: userId },
    });

    const userPosts = await Post.findAll({
      where: { user_id: userId },
      include: [{ association: "stats" }],
    });

    const totalViews = userPosts.reduce(
      (sum, p) => sum + (p.stats?.view_count || 0),
      0
    );
    const totalLikes = userPosts.reduce(
      (sum, p) => sum + (p.stats?.like_count || 0),
      0
    );

    return {
      postsCount: posts,
      commentsCount: comments,
      totalViews,
      totalLikes,
      avgViewsPerPost:
        posts > 0 ? Math.round(totalViews / posts) : 0,
    };
  }

  // Get category statistics
  async getCategoryStats() {
    const stats = await Post.findAll({
      where: { status: "approved" },
      attributes: [
        [sequelize.col("category.id"), "categoryId"],
        [sequelize.col("category.name"), "categoryName"],
        [sequelize.fn("COUNT", sequelize.col("Post.id")), "postCount"],
      ],
      include: [
        {
          model: require("../models").Category,
          as: "category",
          attributes: [],
        },
      ],
      group: ["category.id", "category.name"],
      raw: true,
    });

    return stats;
  }

  // Get monthly activity
  async getMonthlyActivity(months = 6) {
    const data = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0
      );

      const posts = await Post.count({
        where: {
          createdAt: { [Op.between]: [startOfMonth, endOfMonth] },
          status: "approved",
        },
      });

      const comments = await Comment.count({
        where: {
          createdAt: { [Op.between]: [startOfMonth, endOfMonth] },
        },
      });

      data.push({
        month: startOfMonth.toLocaleDateString("vi-VN", {
          month: "long",
          year: "numeric",
        }),
        posts,
        comments,
      });
    }
    return data;
  }
}

module.exports = new AnalyticsService();
