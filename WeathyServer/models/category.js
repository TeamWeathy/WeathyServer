module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'ClothesCategories',
        {
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
