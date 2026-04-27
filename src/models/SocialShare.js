const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SocialShare = sequelize.define('SocialShare', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    postId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Posts',
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    platform: {
        type: DataTypes.ENUM('facebook', 'twitter', 'linkedin', 'instagram', 'pinterest'),
        allowNull: false
    },
    shareUrl: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    shareId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('success', 'failed', 'pending'),
        defaultValue: 'pending'
    },
    metrics: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Store engagement metrics like likes, shares, comments'
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'social_shares',
    timestamps: true
});

module.exports = SocialShare;