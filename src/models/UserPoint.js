const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserPoint = sequelize.define('UserPoint', {
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
    total_points: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    level: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    experience: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    rank_position: {
        type: DataTypes.INTEGER,
        defaultValue: null
    },
    weekly_points: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    monthly_points: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    last_activity_at: {
        type: DataTypes.DATE,
        defaultValue: null
    }
}, {
    tableName: 'user_points',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = UserPoint;
