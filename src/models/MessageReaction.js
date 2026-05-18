const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const MessageReaction = sequelize.define(
  "MessageReaction",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    message_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "messages",
        key: "id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    emoji: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
  },
  {
    tableName: "message_reactions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  },
);

module.exports = MessageReaction;
