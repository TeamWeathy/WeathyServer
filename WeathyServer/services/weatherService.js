const dateUtils = require('../utils/dateUtils');
const { DailyWeather, HourlyWeather } = require('../models');
const climateService = require('./climateService');

module.exports = {
    getDailyWeather: async (code, date) => {
        const dailyWeather = await DailyWeather.findOne({
            where: { location_id: code, date: date }
        });
        if (!dailyWeather) {
            return null;
        }
        return {
            date: {
                month: dateUtils.getMonth(dailyWeather.date),
                day: dateUtils.getDay(dailyWeather.date),
                dayOfWeek: dateUtils.getYoil(dailyWeather.date)
            },
            temperature: {
                maxTemp: dailyWeather.temperature_max,
                minTemp: dailyWeather.temperature_min
            }
        };
    },
    getHourlyWeather: async (code, date, hour, timeFormat) => {
        const hourlyWeather = await HourlyWeather.findOne({
            where: { location_id: code, date: date, hour: hour }
        });
        if (!hourlyWeather) {
            return null;
        }
        return {
            time: timeFormat(hourlyWeather.hour),
            temperature: hourlyWeather.temperature,
            climate: await climateService.getById(hourlyWeather.climate_id),
            pop: hourlyWeather.pop
        };
    }
};
