module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Users',
        {
            nickname: {
                type: DataTypes.STRING(8),
                allowNull: false
            },
            uuid: {
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
