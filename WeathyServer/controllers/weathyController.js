const createError = require('http-errors');

const sc = require('../modules/statusCode');
const weathyService = require('../services/weathyService');
const dayjs = require('dayjs');

const weatherService = require('../services/weatherService');

module.exports = {
    getRecommendedWeathy: async (req, res, next) => {
        const { code, date } = req.query;
        const { userId } = req.params;

        if (userId != req.userId) {
            next(
                createError(
                    sc.BAD_REQUEST,
                    'Parameter Error: userId와 Token이 일치하지 않음'
                )
            );
        }

        const dateRegex = /^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[0-1])$/;
        const isExistWeather = await weatherService.getDailyWeather(code, date);

        if (!dateRegex.test(date) || !code || !isExistWeather) {
            next(
                createError(sc.BAD_REQUEST),
                'Parameter Error: 존재하지않는 날씨 데이터이거나 date, code 형식이 일치하지않습니다.'
            );
        }

        try {
            const recommendedWeathy = await weathyService.getRecommendedWeathy(
                code,
                date,
                userId
            );

            if (!recommendedWeathy) {
                return res.status(sc.NO_CONTENTS).json({});
            }

            return res.status(sc.OK).json(recommendedWeathy);
        } catch (error) {
            switch (error.message) {
                default:
                    next(createError(sc.INTERNAL_SERVER_ERROR));
            }
        }
    },

    getWeathy: async (req, res, next) => {
        const { date } = req.query;
        const userId = req.userId;
        const dateRegex = /^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[0-1])$/;
        const isBefore = dayjs().isBefore(dayjs(date));

        if (!dateRegex.test(date) || !isBefore) {
            return next(
                createError(
                    sc.BAD_REQUEST,
                    'Parameter Error: date 형식에 맞는 과거 날짜를 선택해주세요'
                )
            );
        }

        try {
            const weathy = await weathyService.getWeathy(date, userId);

            if (!weathy) {
                return res.status(sc.NO_CONTENTS).json({});
            }

            return res.status(sc.OK).json({
                ...weathy,
                message: '웨디 기록 조회 성공'
            });
        } catch (error) {
            console.log(error);
            switch (error.message) {
                default:
                    next(createError(sc.INTERNAL_SERVER_ERROR));
            }
        }
    }
};
