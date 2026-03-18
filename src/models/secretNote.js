const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SecretNote = sequelize.define(
  "SecretNote",
  {
    content: { type: DataTypes.TEXT, allowNull: false },
    priority: { type: DataTypes.INTEGER, defaultValue: 1 },
  },
  {
    tableName: "secret_notes",
    underscored: true, // Để khớp với created_at, updated_at ở Migration
  },
);

module.exports = SecretNote;
