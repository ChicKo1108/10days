const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Plan = require('./Plan');

const Quest = sequelize.define('Quest', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    planId: {
        type: DataTypes.UUID,
        allowNull: true, // Can be null for independent quests
        references: {
            model: Plan,
            key: 'id'
        }
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
    orderNum: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('locked', 'ongoing', 'completed', 'skipped'),
        defaultValue: 'locked'
    },
    baseTask: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    stageTasks: {
        type: DataTypes.JSON, // Changed from JSONB to JSON for MySQL support
        allowNull: true
        // Structure: { stage1Task: [], stage2Task: [], stage3Task: [] }
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    }
}, {
    tableName: 'quests',
    timestamps: true,
    updatedAt: false
});

Quest.belongsTo(Plan, { foreignKey: 'planId' });
Plan.hasMany(Quest, { foreignKey: 'planId' });

Quest.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Quest, { foreignKey: 'userId' });

module.exports = Quest;
