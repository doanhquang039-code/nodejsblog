const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Permission = sequelize.define('Permission', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    permission_name: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false
    },
    permission_display_name: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    module: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'posts, users, comments, settings, etc.'
    },
    action: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'create, read, update, delete, publish, etc.'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'permissions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Permission;
