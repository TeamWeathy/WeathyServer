module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'ClimateMessages',
        {
            weather_group: {
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
            paranoid: true,
            indexes: [
                {
                    unique: true,
                    fields: ['weather_group', 'description']
                }
            ]
        }
    );
};
