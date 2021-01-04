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

db.Location.hasMany(db.HourlyWeather, { onDelete: 'cascade' });
db.HourlyWeather.belongsTo(db.Location);

db.Location.hasMany(db.HourlyWeather, { onDelete: 'cascade' });
db.DailyWeather.belongsTo(db.Location);

db.Climate.hasMany(db.DailyWeather, { onDelete: 'cascade' });
db.DailyWeather.belongsTo(db.Climate);

db.Climate.hasMany(db.HourlyWeather, { onDelete: 'cascade' });
db.HourlyWeather.belongsTo(db.Climate);

module.exports = db;
