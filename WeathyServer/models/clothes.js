module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Clothes',
        {
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            name: {
                type: DataTypes.STRING(45),
                allowNull: false
            },
            is_deleted: {
                type: DataTypes.TINYINT(1),
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
