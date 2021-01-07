module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Weathies',
        {
            emoji_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            description: {
                type: DataTypes.STRING(500),
                allowNull: true
            }
        },
        {
            underscored: true,
            freezeTableName: true
        }
    );
};
