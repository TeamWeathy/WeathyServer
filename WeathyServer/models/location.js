module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Locations',
        {
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
