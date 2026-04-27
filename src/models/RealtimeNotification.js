const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RealtimeNotification = sequelize.define('RealtimeNotification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM('like', 'comment', 'follow', 'mention', 'message', 'achievement', 'system'),
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    data: {
        type: DataTypes.JSON,
        defaultValue: null
    },
    link: {
        type: DataTypes.STRING(500),
        defaultValue: null
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_realtime: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    priority: {
        type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
        defaultValue: 'normal'
    },
    read_at: {
        type: DataTypes.DATE,
        defaultValue: null
    }
}, {
    tableName: 'realtime_notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = RealtimeNotification;
