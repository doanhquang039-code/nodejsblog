// src/models/chatbot.js
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Chatbot extends Model {
    static associate(models) {
      // Đổi foreignKey thành user_id sếp nhé
      Chatbot.belongsTo(models.User, { foreignKey: "user_id", as: "author" });
    }
  }
  Chatbot.init(
    {
      question: DataTypes.TEXT,
      answer: DataTypes.TEXT,
      // Cập nhật ở đây
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Chatbot",
      underscored: true, // Thêm dòng này để Sequelize tự hiểu createdAt/updatedAt là created_at/updated_at luôn cho đồng bộ
    },
  );
  return Chatbot;
};
