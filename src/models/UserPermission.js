const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserPermission = sequelize.define('UserPermission', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    permission_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    granted: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'TRUE=granted, FALSE=revoked'
    },
    granted_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    granted_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID who granted/revoked'
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Permission expiration'
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'user_permissions',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'permission_name']
        }
    ]
});

module.exports = UserPermission;
