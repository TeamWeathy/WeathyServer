const { Location, Climate } = require('../models');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'DailyWeathers',
        {
            date: {
                type: DataTypes.DATE,
                allowNull: false
            },
            temperature_max: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            temperature_min: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            humidity: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            precipitation: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            wind_speed: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            wind_direction: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            location_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                reference: {
                    model: Location,
                    key: 'id'
                }
            },
            climate_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                reference: {
                    model: Climate,
                    key: 'id'
                }
            }
        },
        {
            underscored: true,
            freezeTableName: true,
            paranoid: true,
            indexes: [
                {
                    unique: true,
                    fields: ['location_id', 'date']
                }
            ]
        }
    );
};
