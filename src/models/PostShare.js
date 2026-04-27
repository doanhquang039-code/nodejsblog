const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PostShare = sequelize.define('PostShare', {
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
    platform: {
        type: DataTypes.ENUM('facebook', 'twitter', 'linkedin', 'whatsapp', 'telegram', 'email', 'copy_link', 'other'),
        allowNull: false
    },
    customMessage: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    sharedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'post_shares',
    timestamps: false,
    indexes: [
        { fields: ['postId'] },
        { fields: ['userId'] },
        { fields: ['platform'] },
        { fields: ['sharedAt'] }
    ]
});

module.exports = PostShare;