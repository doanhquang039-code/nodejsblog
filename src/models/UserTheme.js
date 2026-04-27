const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserTheme = sequelize.define('UserTheme', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    theme_mode: {
        type: DataTypes.ENUM('light', 'dark', 'auto'),
        defaultValue: 'light'
    },
    primary_color: {
        type: DataTypes.STRING(7),
        defaultValue: '#3b82f6'
    },
    secondary_color: {
        type: DataTypes.STRING(7),
        defaultValue: '#8b5cf6'
    },
    accent_color: {
        type: DataTypes.STRING(7),
        defaultValue: '#10b981'
    },
    font_family: {
        type: DataTypes.STRING(100),
        defaultValue: 'Inter'
    },
    font_size: {
        type: DataTypes.ENUM('small', 'medium', 'large'),
        defaultValue: 'medium'
    },
    custom_css: {
        type: DataTypes.TEXT,
        defaultValue: null
    }
}, {
    tableName: 'user_themes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = UserTheme;
