const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CommentMention = sequelize.define('CommentMention', {
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
        comment: 'User who was mentioned'
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    readAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'comment_mentions',
    timestamps: false,
    indexes: [
        { fields: ['commentId'] },
        { fields: ['userId'] },
        { fields: ['isRead'] }
    ]
});

module.exports = CommentMention;