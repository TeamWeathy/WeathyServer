const { Location, Climate } = require('../models');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'HourlyWeathers',
        {
            date: {
                type: DataTypes.DATE,
                allowNull: false
            },
            hour: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            temperature: {
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
            paranoid: true
        }
    );
};
