const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RolePermission = sequelize.define('RolePermission', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    role_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    permission_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    granted_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    granted_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'User ID who granted this permission'
    }
}, {
    tableName: 'role_permissions',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['role_name', 'permission_name']
        }
    ]
});

module.exports = RolePermission;
