const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const PointTransaction = sequelize.define(
  "PointTransaction",
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
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    action_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    reference_type: {
      type: DataTypes.STRING(50),
      defaultValue: null,
    },
    reference_id: {
      type: DataTypes.INTEGER,
      defaultValue: null,
    },
  },
  {
    tableName: "point_transactions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  },
);

module.exports = PointTransaction;
