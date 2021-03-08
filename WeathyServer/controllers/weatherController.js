const createError = require('http-errors');
const exception = require('../modules/exception');
const statusCode = require('../modules/statusCode');
const dateUtils = require('../utils/dateUtils');
const { locationService, weatherService } = require('../services');

module.exports = {
    getWeatherByLocation: async (req, res, next) => {
        const { lat, lon } = req.query;
        let { code, date } = req.query;

        if (!date) {
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

        let time = date.split('T')[1] ? date.split('T')[1] : null;
        date = date.split('T')[0];
        if (!date) {
            return next(createError(400));
        }

        try {
            const overviewWeather = await weatherService.getOverviewWeather(
                code,
                date,
                time,
                dateUtils.format12
            );
            if (!overviewWeather) {
                throw Error(exception.NO_DATA);
            }
            return res.status(statusCode.OK).json({
                overviewWeather,
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
    },
    getHourlyWeatherForecast: async (req, res, next) => {
        let { code, date } = req.query;
        if (!code || !date) {
            return next(createError(400));
        }

        let time = date.split('T')[1];
        date = date.split('T')[0];
        if (!date || !time) {
            return next(createError(400));
        }

        let hourlyWeatherList = [];
        for (let i = 0; i < 24; ++i) {
            hourlyWeatherList.push(
                await weatherService.getHourlyWeather(
                    code,
                    date,
                    time,
                    dateUtils.format24
                )
            );
            const { next_date, next_time } = dateUtils.getNextHour(date, time);
            date = next_date;
            time = next_time;
        }
        return res.status(statusCode.OK).json({
            hourlyWeatherList,
            message: '시간 별 날씨 조회 성공'
        });
    },
    getDailyWeatherForecast: async (req, res, next) => {
        let { code, date } = req.query;
        if (!code || !date) {
            return next(createError(400));
        }

        date = date.split('T')[0];
        if (!date) {
            return next(createError(400));
        }

        let dailyWeatherList = [];
        for (let i = 0; i < 7; ++i) {
            dailyWeatherList.push(
                await weatherService.getDailyWeatherWithClimateIconId(
                    code,
                    date
                )
            );
            date = dateUtils.getNextDay(date);
        }
        return res.status(statusCode.OK).json({
            dailyWeatherList,
            message: '일자 별 날씨 조회 성공'
        });
    },
    getExtraDailyWeather: async (req, res, next) => {
        let { code, date } = req.query;
        if (!code || !date) {
            return next(createError(400));
        }

        date = date.split('T')[0];
        if (!date) {
            return next(createError(400));
        }

        try {
            let extraWeather = await weatherService.getExtraDailyWeather(
                code,
                date
            );
            return res.status(statusCode.OK).json({
                extraWeather,
                message: '상세 날씨 조회 성공'
            });
        } catch (error) {
            switch (error.message) {
                case exception.NO_DATA:
                    return res.status(statusCode.NO_CONTENT).json({
                        extraWeather: null,
                        message: '날씨 정보를 찾을 수 없음'
                    });
                default:
                    return next(createError(400));
            }
        }
    },
    getWeathersByKeyword: async (req, res, next) => {
        let { keyword, date } = req.query;
        if (!keyword || !date) {
            return next(createError(400));
        }

        let time = date.split('T')[1] || null;
        date = date.split('T')[0];

        if (!date) {
            return next(createError(400));
        }

        try {
            const overviewWeatherList = await weatherService.getOverviewWeathers(
                keyword,
                date,
                time,
                dateUtils.format12
            );

            return res.status(statusCode.OK).json({
                overviewWeatherList,
                message: '검색 성공'
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
