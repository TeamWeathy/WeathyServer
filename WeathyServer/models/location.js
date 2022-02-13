const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Locations',
        {
            id: {
                type: Sequelize.BIGINT,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING(45),
                allowNull: false
            },
            lat: {
                type: DataTypes.DOUBLE,
                allowNull: false
            },
            lng: {
                type: DataTypes.DOUBLE,
                allowNull: false
            }
        },
        {
            underscored: true,
            freezeTableName: true,
            paranoid: true
        }
    );
};
