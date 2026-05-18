const { Post, Category, Tag, sequelize } = require("../models");
const { Op } = require("sequelize");

class SearchService {
  // Full-text search with filters
  async searchPosts(query, filters = {}) {
    const {
      categoryId,
      tagId,
      status = "approved",
      sortBy = "latest",
      limit = 10,
      offset = 0,
    } = filters;

    const where = {};
    const include = [];

    // Text search in title and content
    if (query) {
      where[Op.or] = [
        sequelize.where(
          sequelize.fn("LOWER", sequelize.col("title")),
          Op.like,
          `%${query.toLowerCase()}%`
        ),
        sequelize.where(
          sequelize.fn("LOWER", sequelize.col("content")),
          Op.like,
          `%${query.toLowerCase()}%`
        ),
      ];
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by category
    if (categoryId) {
      where.category_id = categoryId;
    }

    // Search with category
    include.push({
      model: Category,
      as: "category",
      attributes: ["id", "name"],
      where: categoryId ? { id: categoryId } : undefined,
    });

    // Search with tags
    if (tagId) {
      include.push({
        model: Tag,
        as: "tags",
        attributes: ["id", "name"],
        through: { attributes: [] },
        where: { id: tagId },
      });
    } else {
      include.push({
        model: Tag,
        as: "tags",
        attributes: ["id", "name"],
        through: { attributes: [] },
      });
    }

    // Sort options
    const order = [];
    switch (sortBy) {
      case "popular":
        order.push([sequelize.col("stats.like_count"), "DESC"]);
        break;
      case "trending":
        order.push([sequelize.col("stats.view_count"), "DESC"]);
        break;
      case "oldest":
        order.push(["createdAt", "ASC"]);
        break;
      case "latest":
      default:
        order.push(["createdAt", "DESC"]);
    }

    include.push({
      association: "stats",
      required: false,
    });

    const { rows, count } = await Post.findAndCountAll({
      where,
      include,
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true,
    });

    return {
      posts: rows,
      total: count,
      page: Math.floor(offset / limit) + 1,
      pages: Math.ceil(count / limit),
    };
  }

  // Get trending posts
  async getTrendingPosts(days = 7) {
    const date = new Date();
    date.setDate(date.getDate() - days);

    return await Post.findAll({
      where: { status: "approved", createdAt: { [Op.gte]: date } },
      include: [
        {
          association: "stats",
          required: false,
        },
      ],
      order: [[sequelize.col("stats.view_count"), "DESC"]],
      limit: 10,
    });
  }

  // Advanced search with aggregation
  async getSearchStats(query) {
    const posts = await Post.findAll({
      where: {
        status: "approved",
        [Op.or]: [
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("title")),
            Op.like,
            `%${query.toLowerCase()}%`
          ),
        ],
      },
      include: [
        { model: Category, as: "category", attributes: ["id", "name"] },
        {
          model: Tag,
          as: "tags",
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
      ],
    });

    // Count by category
    const byCategory = {};
    posts.forEach((post) => {
      const catName = post.category?.name || "Other";
      byCategory[catName] = (byCategory[catName] || 0) + 1;
    });

    return {
      total: posts.length,
      byCategory,
      posts,
    };
  }
}

module.exports = new SearchService();
