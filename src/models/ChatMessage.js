const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ChatMessage = sequelize.define('ChatMessage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sessionId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'chat_sessions',
            key: 'sessionId'
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
    sender: {
        type: DataTypes.ENUM('user', 'bot'),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    messageType: {
        type: DataTypes.ENUM('text', 'rich', 'mixed', 'action'),
        defaultValue: 'text'
    },
    attachments: {
        type: DataTypes.JSON,
        allowNull: true
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Additional data like intent, entities, etc.'
    },
    suggestions: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Quick reply suggestions'
    },
    rating: {
        type: DataTypes.ENUM('helpful', 'not_helpful'),
        allowNull: true
    },
    feedback: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    ratedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'chat_messages',
    timestamps: false,
    indexes: [
        { fields: ['sessionId'] },
        { fields: ['userId'] },
        { fields: ['sender'] },
        { fields: ['createdAt'] }
    ]
});

module.exports = ChatMessage;