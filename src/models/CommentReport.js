const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CommentReport = sequelize.define('CommentReport', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    commentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Comments',
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
        comment: 'User who reported the comment'
    },
    reason: {
        type: DataTypes.ENUM('spam', 'harassment', 'hate_speech', 'misinformation', 'inappropriate', 'other'),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'reviewed', 'action_taken', 'dismissed'),
        defaultValue: 'pending'
    },
    reviewedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    reviewedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    actionTaken: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Description of action taken (e.g., comment deleted, user warned)'
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
    tableName: 'comment_reports',
    timestamps: true,
    indexes: [
        { fields: ['commentId'] },
        { fields: ['userId'] },
        { fields: ['status'] },
        { fields: ['reason'] },
        { unique: true, fields: ['commentId', 'userId'] }
    ]
});

module.exports = CommentReport;