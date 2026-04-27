const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Achievement = sequelize.define('Achievement', {
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
    category: {
        type: DataTypes.ENUM('posts', 'engagement', 'social', 'special', 'milestone'),
        allowNull: false
    },
    icon: {
        type: DataTypes.STRING(50)
    },
    color: {
        type: DataTypes.STRING(7)
    },
    points: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    requirement_type: {
        type: DataTypes.ENUM('count', 'streak', 'quality', 'special'),
        allowNull: false
    },
    requirement_value: {
        type: DataTypes.INTEGER
    },
    requirement_data: {
        type: DataTypes.JSON
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    rarity: {
        type: DataTypes.ENUM('common', 'rare', 'epic', 'legendary'),
        defaultValue: 'common'
    }
}, {
    tableName: 'achievements',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Achievement;
