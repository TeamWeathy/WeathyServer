module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Climates',
        {
            icon_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            description: {
                type: DataTypes.STRING(100),
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
