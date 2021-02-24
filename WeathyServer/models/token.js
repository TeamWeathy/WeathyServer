module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Token',
        {
            token: {
                type: DataTypes.STRING(45),
                allowNull: false
            }
        },
        {
            underscored: true,
            freezeTableName: true
        }
    );
};
