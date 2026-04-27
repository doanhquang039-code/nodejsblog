const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PostView = sequelize.define('PostView', {
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
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    viewerKey: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Unique key for tracking (user_id or ip_address)'
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userAgent: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    referrer: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    sessionId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'post_views',
    timestamps: false,
    indexes: [
        { fields: ['postId'] },
        { fields: ['userId'] },
        { fields: ['viewerKey', 'postId'] },
        { fields: ['createdAt'] }
    ]
});

module.exports = PostView;