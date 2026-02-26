const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Quest = require('./Quest');

const CheckIn = sequelize.define('CheckIn', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    questId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Quest,
            key: 'id'
        }
    },
    dayNum: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('completed', 'skipped'),
        allowNull: false
    },
    stampText: {
        type: DataTypes.ENUM('既成', '愿遂', '笔讫', '墨就'),
        allowNull: true
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'check_ins',
    timestamps: true,
    updatedAt: false,
    indexes: [
        {
            unique: true,
            fields: ['questId', 'dayNum']
        }
    ]
});

CheckIn.belongsTo(Quest, { foreignKey: 'questId' });
Quest.hasMany(CheckIn, { foreignKey: 'questId' });

module.exports = CheckIn;
