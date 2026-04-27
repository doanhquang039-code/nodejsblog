const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Role = sequelize.define('Role', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    role_name: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
    },
    role_display_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Priority level: 1=Admin, 2=Editor, 3=Author, 4=Reader'
    },
    color: {
        type: DataTypes.STRING(20),
        defaultValue: '#3b82f6'
    },
    icon: {
        type: DataTypes.STRING(50),
        defaultValue: '👤'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'roles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Role;
