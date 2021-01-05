const { Weathy, Clothes } = require('../models');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'WeathyClothes',
        {
            weathy_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                reference: {
                    model: Weathy,
                    key: 'id'
                }
            },
            clothes_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                reference: {
                    model: Clothes,
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
