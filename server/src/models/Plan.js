const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Plan = sequelize.define('Plan', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    totalDays: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('ongoing', 'completed'),
        defaultValue: 'ongoing'
    }
}, {
    tableName: 'plans',
    timestamps: true,
    updatedAt: false
});

Plan.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Plan, { foreignKey: 'userId' });

module.exports = Plan;
