const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const PostAnalytics = sequelize.define(
  "PostAnalytics",
  {
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    view_count: {
      // ← đổi từ "views" thành "view_count"
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    like_count: {
      // ← thêm cột này cho khớp DB
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "PostAnalytics",
    timestamps: true,
    // SẾP ĐỔI DÒNG NÀY THÀNH FALSE HOẶC XÓA ĐI
    underscored: false,
  },
);

module.exports = PostAnalytics;
