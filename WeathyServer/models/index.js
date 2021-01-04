const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/database.json')[env];
const batch_DB = {};

let batchSequelize;

if (config.use_env_variable) {
    batchSequelize = new Sequelize(
        process.env[config.use_env_variable],
        config['batch']
    );
} else {
    batchSequelize = new Sequelize(
        config['batch'].database,
        config['batch'].username,
        config['batch'].password,
        config['batch']
    );
}

batch_DB.sequelize = batchSequelize;
batch_DB.Sequelize = Sequelize;

batch_DB.HourlyWeather = require('./hourlyWeather')(batchSequelize, Sequelize);
batch_DB.DailyWeather = require('./dailyWeather')(batchSequelize, Sequelize);
batch_DB.Location = require('./location')(batchSequelize, Sequelize);
batch_DB.Climate = require('./climate')(batchSequelize, Sequelize);

batch_DB.Location.hasMany(batch_DB.HourlyWeather, { onDelete: 'cascade' });
batch_DB.HourlyWeather.belongsTo(batch_DB.Location);

batch_DB.Location.hasMany(batch_DB.HourlyWeather, { onDelete: 'cascade' });
batch_DB.DailyWeather.belongsTo(batch_DB.Location);

batch_DB.Climate.hasMany(batch_DB.DailyWeather, { onDelete: 'cascade' });
batch_DB.DailyWeather.belongsTo(batch_DB.Climate);

batch_DB.Climate.hasMany(batch_DB.HourlyWeather, { onDelete: 'cascade' });
batch_DB.HourlyWeather.belongsTo(batch_DB.Climate);

module.exports = batch_DB;
