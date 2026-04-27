const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CommentReaction = sequelize.define('CommentReaction', {
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
        }
    },
    reactionType: {
        type: DataTypes.ENUM('like', 'love', 'haha', 'wow', 'sad', 'angry'),
        allowNull: false,
        defaultValue: 'like'
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
    tableName: 'comment_reactions',
    timestamps: true,
    indexes: [
        { fields: ['commentId'] },
        { fields: ['userId'] },
        { unique: true, fields: ['commentId', 'userId'] },
        { fields: ['reactionType'] }
    ]
});

module.exports = CommentReaction;