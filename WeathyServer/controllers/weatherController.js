const createError = require('http-errors');
const exception = require('../modules/exception');
const statusCode = require('../modules/statusCode');
const dateUtils = require('../utils/dateUtils');
const { locationService, weatherService } = require('../services');

module.exports = {
    getWeatherByLocation: async (req, res, next) => {
        // skip token validation

        const { lat, lon, datetime } = req.query;
        let { code } = req.query;
        let date, time;

        if (!datetime) {
            return next(createError(400));
        } else if (!code && (!lat || !lon)) {
            return next(createError(400));
        } else if (!code) {
            try {
                code = await locationService.getCode(lat, lon);
            } catch (error) {
                switch (error.message) {
                    case exception.INVALID_LOCATION:
                        return next(createError(204));
                    default:
                        return next(createError(500));
                }
            }
        }

        date = datetime.split('T')[0];
        time = datetime.split('T')[1];
        if (!date || !time) {
            return next(createError(400));
        }

        try {
            const location = locationService.getLocationByCode(code);
            const dailyWeather = weatherService.getDailyWeather(code, date);
            const hourlyWeather = weatherService.getHourlyWeather(
                code,
                date,
                time,
                dateUtils.format12
            );
            if (!dailyWeather || !hourlyWeather) {
                throw exception.NO_DATA;
            }
            return res.status(statusCode.OK).json({
                overviewWeather: {
                    region: location,
                    dailyWeather,
                    hourlyWeather
                },
                message: '실시간 날씨 정보 반환 성공'
            });
        } catch (error) {
            switch (error.message) {
                case exception.NO_DATA:
                    return next(createError(204));
                default:
                    return next(createError(500));
            }
        }
    }
};
