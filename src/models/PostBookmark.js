const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PostBookmark = sequelize.define('PostBookmark', {
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
    collectionName: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Optional collection/folder name for organizing bookmarks'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Personal notes about the bookmarked post'
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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
    tableName: 'post_bookmarks',
    timestamps: true,
    indexes: [
        { fields: ['postId'] },
        { fields: ['userId'] },
        { unique: true, fields: ['postId', 'userId'] },
        { fields: ['collectionName'] }
    ]
});

module.exports = PostBookmark;