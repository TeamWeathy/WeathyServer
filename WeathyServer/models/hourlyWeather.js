module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'HourlyWeathers',
        {
            date: {
                type: DataTypes.DATE,
                allowNull: false
            },
            hour: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            temperature: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            pop: {
                type: DataTypes.INTEGER,
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
                    fields: ['date', 'hour', 'location_id']
                }
            ]
        }
    );
};
