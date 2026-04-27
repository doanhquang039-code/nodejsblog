const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserBadge = sequelize.define('UserBadge', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    badgeType: {
        type: DataTypes.ENUM(
            'verified',
            'top_contributor',
            'early_adopter',
            'prolific_writer',
            'helpful_commenter',
            'trending_author',
            'community_leader',
            'expert',
            'moderator'
        ),
        allowNull: false
    },
    badgeName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    badgeDescription: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    badgeIcon: {
        type: DataTypes.STRING,
        allowNull: true
    },
    badgeColor: {
        type: DataTypes.STRING,
        defaultValue: '#3B82F6'
    },
    earnedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    displayOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'user_badges',
    timestamps: false,
    indexes: [
        { fields: ['userId'] },
        { fields: ['badgeType'] },
        { fields: ['isActive'] }
    ]
});

module.exports = UserBadge;