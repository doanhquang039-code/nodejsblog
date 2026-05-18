const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const UserAchievement = sequelize.define(
  "UserAchievement",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    achievement_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "achievements",
        key: "id",
      },
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    completed_at: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    notified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "user_achievements",
    timestamps: false,
  },
);

module.exports = UserAchievement;
