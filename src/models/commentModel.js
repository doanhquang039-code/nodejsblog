const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Comment = sequelize.define(
  "Comment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    postId: {
      type: DataTypes.INTEGER,
      field: "post_id",
    },
    userId: {
      type: DataTypes.INTEGER,
      field: "user_id",
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: "updated_at",
    },
  },
  {
    tableName: "comments",
    timestamps: true,
    underscored: true, // ← thêm dòng này
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = Comment;
