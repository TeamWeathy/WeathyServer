const { User, WeathyClothes } = require('../models');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Weathies',
        {
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                reference: {
                    model: User,
                    key: 'id'
                }
            },
            dailyWeather_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                reference: {
                    model: WeathyClothes,
                    key: 'id'
                }
            },
            emoji_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            description: {
                type: DataTypes.STRING(500),
                allowNull: true
            }
        },
        {
            underscored: true,
            freezeTableName: true
        }
    );
};
