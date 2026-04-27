const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ThemePreset = sequelize.define('ThemePreset', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    theme_mode: {
        type: DataTypes.ENUM('light', 'dark'),
        allowNull: false
    },
    primary_color: {
        type: DataTypes.STRING(7),
        allowNull: false
    },
    secondary_color: {
        type: DataTypes.STRING(7),
        allowNull: false
    },
    accent_color: {
        type: DataTypes.STRING(7),
        allowNull: false
    },
    preview_image: {
        type: DataTypes.STRING(500)
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    usage_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'theme_presets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = ThemePreset;
