const { ClothesCategory } = require('../models');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Clothes',
        {
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            category_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                reference: {
                    model: ClothesCategory,
                    key: 'id'
                }
            },
            name: {
                type: DataTypes.STRING(45),
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
