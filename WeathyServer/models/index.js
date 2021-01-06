const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/database.json')[env];
const db = {};

let sequelize;

if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    sequelize = new Sequelize(
        config.database,
        config.username,
        config.password,
        config
    );
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.HourlyWeather = require('./hourlyWeather')(sequelize, Sequelize);
db.DailyWeather = require('./dailyWeather')(sequelize, Sequelize);
db.Location = require('./location')(sequelize, Sequelize);
db.Climate = require('./climate')(sequelize, Sequelize);
db.User = require('./user')(sequelize, Sequelize);
db.ClothesCategory = require('./category')(sequelize, Sequelize);
db.Clothes = require('./clothes')(sequelize, Sequelize);
db.WeathyClothes = require('./weathyClothes')(sequelize, Sequelize);
db.Weathy = require('./weathy')(sequelize, Sequelize);
db.Token = require('./token')(sequelize, Sequelize);

db.Location.hasMany(
    db.HourlyWeather,
    { foreignKey: 'location_id' },
    { onDelete: 'RESTRICT' }
);
db.HourlyWeather.belongsTo(db.Location, {
    foreignKey: 'location_id'
});

db.Location.hasMany(
    db.HourlyWeather,
    { foreignKey: 'location_id' },
    { onDelete: 'RESTRICT' }
);
db.DailyWeather.belongsTo(db.Location, {
    foreignKey: 'location_id'
});

db.Climate.hasMany(
    db.DailyWeather,
    { foreignKey: 'climate_id' },
    { onDelete: 'RESTRICT' }
);
db.DailyWeather.belongsTo(db.Climate, {
    foreignKey: 'climate_id'
});

db.Climate.hasMany(
    db.HourlyWeather,
    { foreignKey: 'climate_id' },
    { onDelete: 'RESTRICT' }
);
db.HourlyWeather.belongsTo(db.Climate, { foreignKey: 'climate_id' });

db.User.hasMany(db.Weathy, { foreignKey: 'user_id' }, { onDelete: 'CASCADE' });
db.Weathy.belongsTo(db.User, { foreignKey: 'user_id' });

db.User.hasMany(db.Clothes, { foreignKey: 'user_id' }, { onDelete: 'CASCADE' });
db.Clothes.belongsTo(db.User, { foreignKey: 'user_id' });

db.ClothesCategory.hasMany(db.Clothes, {
    foreignKey: 'category_id'
});
db.Clothes.belongsTo(db.ClothesCategory, {
    foreignKey: 'category_id'
});

db.Clothes.hasMany(db.WeathyClothes, { foreignKey: 'clothes_id' });
db.WeathyClothes.belongsTo(db.Clothes, { foreignKey: 'clothes_id' });

db.Weathy.hasMany(
    db.WeathyClothes,
    { foreignKey: 'weathy_id', onDelete: 'CASCADE' }
    // { onDelete: 'CASCADE' }
);
db.WeathyClothes.belongsTo(db.Weathy, { foreignKey: 'weathy_id' });

db.DailyWeather.hasMany(
    db.Weathy,
    { foreignKey: 'dailyweather_id' },
    { onDelete: 'cascade' }
);
db.Weathy.belongsTo(db.DailyWeather, { foreignKey: 'dailyweather_id' });

db.User.hasOne(db.Token, { foreignKey: 'user_id' }, { onDelete: 'cascade' });
db.Token.belongsTo(db.User, { foreignKey: 'user_id' });

module.exports = db;
