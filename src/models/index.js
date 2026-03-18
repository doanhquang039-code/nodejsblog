const User = require("./userModel");
const Post = require("./postModel");
const Category = require("./categoryModel");
const Tag = require("./tagModel");
const Comment = require("./commentModel");
const PostTag = require("./postTagModel");
const PostAnalytics = require("./postAnalyticsModel");

// 1. QUAN HỆ USERS - POSTS (1-N)
// Sếp dùng 'userId' vì trong Model Post mình đã map nó tới 'user_id'
User.hasMany(Post, { foreignKey: "userId", as: "posts" });
Post.belongsTo(User, { foreignKey: "userId", as: "author" });

// 2. QUAN HỆ CATEGORIES - POSTS (1-N)
Category.hasMany(Post, { foreignKey: "categoryId", as: "posts" });
Post.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

// 3. QUAN HỆ POSTS - TAGS (N-N)
Post.belongsToMany(Tag, {
  through: PostTag,
  foreignKey: "post_id",
  otherKey: "tag_id",
  as: "tags",
});
Tag.belongsToMany(Post, {
  through: PostTag,
  foreignKey: "tag_id",
  otherKey: "post_id",
  as: "posts",
});

// 4. QUAN HỆ COMMENTS (1-N)
User.hasMany(Comment, { foreignKey: "user_id" });
Comment.belongsTo(User, { foreignKey: "user_id" });

Post.hasMany(Comment, { foreignKey: "post_id", as: "comments" });
Comment.belongsTo(Post, { foreignKey: "post_id" });

// 5. QUAN HỆ POSTS - ANALYTICS (1-1)
// Cái này giúp hiện View/Like ở trang danh sách bài viết sếp nhé
Post.hasOne(PostAnalytics, { foreignKey: "post_id", as: "stats" });
PostAnalytics.belongsTo(Post, { foreignKey: "post_id" });

// CHỈ XUẤT 1 LẦN DUY NHẤT
module.exports = {
  User,
  Post,
  Category,
  Tag,
  Comment,
  PostTag,
  PostAnalytics,
};
