const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ChatSession = sequelize.define('ChatSession', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    session_id: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        field: 'session_id'
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'user_id'
    },
    status: {
        type: DataTypes.ENUM('active', 'closed', 'expired'),
        defaultValue: 'active'
    },
    context: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    started_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'started_at'
    },
    last_activity_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'last_activity_at'
    },
    ended_at: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'ended_at'
    }
}, {
    tableName: 'chat_sessions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
});

module.exports = ChatSession;