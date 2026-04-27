const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    conversation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'conversations',
            key: 'id'
        }
    },
    sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    message_type: {
        type: DataTypes.ENUM('text', 'image', 'file', 'link', 'system'),
        defaultValue: 'text'
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    attachments: {
        type: DataTypes.JSON,
        defaultValue: null
    },
    reply_to_id: {
        type: DataTypes.INTEGER,
        defaultValue: null,
        references: {
            model: 'messages',
            key: 'id'
        }
    },
    is_edited: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Message;
