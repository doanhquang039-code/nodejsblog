const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserFollower = sequelize.define('UserFollower', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    followerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
        comment: 'User who is following'
    },
    followingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
        comment: 'User being followed'
    },
    notificationsEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'user_followers',
    timestamps: false,
    indexes: [
        { fields: ['followerId'] },
        { fields: ['followingId'] },
        { unique: true, fields: ['followerId', 'followingId'] }
    ]
});

module.exports = UserFollower;