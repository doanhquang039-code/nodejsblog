const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Post = sequelize.define(
  "Post",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, field: "user_id" },
    categoryId: { type: DataTypes.INTEGER, field: "category_id" },
    title: { type: DataTypes.STRING, allowNull: false },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "slug",
    },
    content: { type: DataTypes.TEXT, allowNull: false },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "image",
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
  },
  {
    tableName: "posts",
    timestamps: true,
    underscored: true,
  },
);
Post.afterCreate(async (post, options) => {
  try {
    const PostAnalytics = post.sequelize.models.PostAnalytics;

    if (PostAnalytics) {
      await PostAnalytics.create({
        post_id: post.id,
        view_count: 0,
        like_count: 0,
      });
      console.log(`✅ Đã tạo thống kê cho bài viết ID: ${post.id}`);
    }
  } catch (error) {
    console.error("❌ Lỗi Hook afterCreate:", error.message);
  }
});
module.exports = Post;
