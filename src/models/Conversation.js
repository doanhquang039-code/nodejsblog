const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Conversation = sequelize.define('Conversation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: DataTypes.ENUM('direct', 'group'),
        defaultValue: 'direct'
    },
    name: {
        type: DataTypes.STRING(255),
        defaultValue: null
    },
    avatar: {
        type: DataTypes.STRING(500),
        defaultValue: null
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    last_message_id: {
        type: DataTypes.INTEGER,
        defaultValue: null
    },
    last_message_at: {
        type: DataTypes.DATE,
        defaultValue: null
    },
    is_archived: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'conversations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Conversation;
