module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'WeathyClothes',
        {},
        {
            underscored: true,
            freezeTableName: true
        }
    );
};
