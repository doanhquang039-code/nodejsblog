const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PostLike = sequelize.define('PostLike', {
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
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'post_likes',
    timestamps: false,
    indexes: [
        { fields: ['postId'] },
        { fields: ['userId'] },
        { unique: true, fields: ['postId', 'userId'] }
    ]
});

module.exports = PostLike;