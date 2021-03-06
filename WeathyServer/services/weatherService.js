const dateUtils = require('../utils/dateUtils');
const exception = require('../modules/exception');
const { DailyWeather, HourlyWeather } = require('../models');
const climateService = require('./climateService');
const locationService = require('./locationService');

const getRainRating = (value) => {
    if (value < 1) return 1;
    else if (value < 5) return 2;
    else if (value < 20) return 3;
    else if (value < 80) return 4;
    else if (value < 150) return 5;
    else return 6;
};

const getHumidityRating = (value) => {
    if (value <= 20) return 1;
    else if (value <= 40) return 2;
    else if (value <= 60) return 3;
    else if (value <= 80) return 4;
    else if (value <= 100) return 5;
};

const getWindRating = (value) => {
    if (value <= 1) return 1;
    else if (value <= 4) return 2;
    else if (value <= 8) return 3;
    else if (value <= 12) return 4;
    else if (value <= 17) return 5;
    else return 6;
};

const getDailyWeather = async (code, date) => {
    const dailyWeather = await DailyWeather.findOne({
        where: { location_id: code, date: date }
    });

    if (!dailyWeather) {
        return null;
    }
    return {
        date: {
            year: dateUtils.getYear(dailyWeather.date),
            month: dateUtils.getMonth(dailyWeather.date),
            day: dateUtils.getDay(dailyWeather.date),
            dayOfWeek: dateUtils.getYoil(dailyWeather.date)
        },
        temperature: {
            maxTemp: dailyWeather.temperature_max,
            minTemp: dailyWeather.temperature_min
        }
    };
};

const getHourlyWeather = async (code, date, hour, timeFormat) => {
    const hourlyWeather = await HourlyWeather.findOne({
        where: { location_id: code, date: date, hour: hour }
    });
    if (!hourlyWeather) {
        return null;
    }
    return {
        time: timeFormat(hourlyWeather.hour),
        temperature: hourlyWeather.temperature,
        climate: await climateService.getClimate(
            hourlyWeather.climate_id,
            hourlyWeather.temperature
        ),
        pop: hourlyWeather.pop
    };
};
const getDailyWeatherWithClimateIconId = async (code, date) => {
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
        },
        climateIconId: dailyWeather.climate_id
    };
};

module.exports = {
    getHourlyWeather,
    getDailyWeather,
    getDailyWeatherWithClimateIconId,
    getOverviewWeather: async (code, date, hour, timeFormat) => {
        let dailyClimate;
        if (!hour) {
            hour = 12;

            const dailyWeatherWithClimate = await getDailyWeatherWithClimateIconId(
                code,
                date
            );

            if (!dailyWeatherWithClimate) return null;

            dailyClimate = await climateService.getClimateByIconId(
                dailyWeatherWithClimate.climateIconId
            );
        }
        const location = await locationService.getLocationByCode(code);
        const dailyWeather = await getDailyWeather(code, date);
        const hourlyWeather = await getHourlyWeather(
            code,
            date,
            hour,
            timeFormat
        );

        if (!dailyWeather || !hourlyWeather) {
            return null;
        }

        if (dailyClimate) hourlyWeather.climate = dailyClimate;

        return {
            region: location,
            dailyWeather,
            hourlyWeather
        };
    },

    getOverviewWeathers: async (keyword, date, hour, timeFormat) => {
        let defaultClimateFlag = false;

        if (!hour) {
            hour = 12;
            defaultClimateFlag = true;
        }

        const locations = await locationService.getLocationsByKeyword(keyword);
        let overviewWeatherList = [];

        for (let i = 0; i < locations.length; ++i) {
            const location = locations[i];
            const dailyWeather = await getDailyWeather(
                location.dataValues.code,
                date
            );
            const hourlyWeather = await getHourlyWeather(
                location.dataValues.code,
                date,
                hour,
                timeFormat
            );
            if (!dailyWeather || !hourlyWeather) {
                continue;
            }
            if (defaultClimateFlag) {
                const dailyWeatherWithClimate = await getDailyWeatherWithClimateIconId(
                    location.dataValues.code,
                    date
                );

                if (!dailyWeatherWithClimate) continue;

                hourlyWeather.climate = await climateService.getClimateByIconId(
                    dailyWeatherWithClimate.climateIconId
                );
            }

            overviewWeatherList.push({
                region: location,
                dailyWeather,
                hourlyWeather
            });
        }
        return overviewWeatherList;
    },

    getExtraDailyWeather: async (code, date) => {
        const dailyWeather = await DailyWeather.findOne({
            where: { location_id: code, date: date }
        });
        if (!dailyWeather) {
            throw Error(exception.NO_DATA);
        }
        return {
            rain: {
                value: dailyWeather.precipitation,
                rating: getRainRating(dailyWeather.precipitation)
            },
            humidity: {
                value: dailyWeather.humidity,
                rating: getHumidityRating(dailyWeather.humidity)
            },
            wind: {
                value: dailyWeather.wind_speed,
                rating: getWindRating(dailyWeather.wind_speed)
            }
        };
    },

    getDailyClimateId: async (code, date) => {
        const dailyWeather = await DailyWeather.findOne({
            where: { location_id: code, date }
        });
        if (!dailyWeather) {
            return null;
        }
        return {
            climateId: dailyWeather.climate_id
        };
    },

    getDailyWeatherId: async (code, date) => {
        const dailyWeather = await DailyWeather.findOne({
            where: {
                location_id: code,
                date
            }
        });

        if (!dailyWeather) {
            return null;
        }

        return dailyWeather.id;
    }
};
