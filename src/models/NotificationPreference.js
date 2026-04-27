const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NotificationPreference = sequelize.define('NotificationPreference', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    email_notifications: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    push_notifications: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    realtime_notifications: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    notification_types: {
        type: DataTypes.JSON,
        defaultValue: {
            like: true,
            comment: true,
            follow: true,
            mention: true,
            message: true,
            achievement: true,
            system: true
        }
    },
    quiet_hours_start: {
        type: DataTypes.TIME,
        defaultValue: null
    },
    quiet_hours_end: {
        type: DataTypes.TIME,
        defaultValue: null
    }
}, {
    tableName: 'notification_preferences',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = NotificationPreference;
