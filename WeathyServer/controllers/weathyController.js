const createError = require('http-errors');

const sc = require('../modules/statusCode');
const weathyService = require('../services/weathyService');
const dayjs = require('dayjs');

const weatherService = require('../services/weatherService');
const exception = require('../modules/exception');
const logger = require('winston');

module.exports = {
    getRecommendedWeathy: async (req, res, next) => {
        const { code, date } = req.query;
        const { userId } = req.params;
        const dateRegex = /^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[0-1])$/;

        if (userId != req.userId) {
            return next(
                createError(
                    sc.BAD_REQUEST,
                    'Parameter Error: userId와 Token이 일치하지 않음'
                )
            );
        }

        const isExistWeather = await weatherService.getDailyWeather(code, date);

        if (!dateRegex.test(date) || !code || !isExistWeather) {
            return next(
                createError(
                    sc.BAD_REQUEST,
                    'Parameter Error: 존재하지않는 날씨 데이터이거나 date, code 형식이 일치하지않습니다.'
                )
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

            return res.status(sc.OK).json({
                ...recommendedWeathy,
                message: '추천 웨디 조회 성공'
            });
        } catch (error) {
            switch (error.message) {
                default:
                    return next(createError(sc.INTERNAL_SERVER_ERROR));
            }
        }
    },

    getWeathy: async (req, res, next) => {
        const { date } = req.query;
        const userId = req.userId;
        const dateRegex = /^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[0-1])$/;
        const isPast = dayjs().isAfter(dayjs(date));

        if (!dateRegex.test(date) || !isPast) {
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
            switch (error.message) {
                default:
                    next(createError(sc.INTERNAL_SERVER_ERROR));
            }
        }
    },

    createWeathy: async (req, res, next) => {
        const { date, code, clothes, stampId, feedback, userId } = req.body;
        const dateRegex = /^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[0-1])$/;

        if (!dateRegex.test(date) || !code || !clothes || !stampId) {
            return next(createError(sc.BAD_REQUEST, 'Parameter Error'));
        }

        if (userId != req.userId) {
            return next(
                createError(
                    sc.NO_AUTHORITY,
                    'Autority Error: Token 또는 UserId를 확인해주세요'
                )
            );
        }

        try {
            const dailyWeatherId = await weatherService.getDailyWeatherId(
                code,
                date
            );

            if (!dailyWeatherId) {
                throw Error(exception.NO_DAILY_WEATHER);
            }

            const checkOwnerClothes = await weathyService.checkOwnerClothes(
                clothes,
                userId
            );

            if (!checkOwnerClothes) {
                return next(
                    createError(
                        sc.NO_AUTHORITY,
                        '옷에 대한 접근 권한이 없습니다.'
                    )
                );
            }

            await weathyService.createWeathy(
                dailyWeatherId,
                clothes,
                stampId,
                userId,
                feedback || null
            );

            return res.status(sc.OK).json({
                message: '웨디 기록 성공'
            });
        } catch (error) {
            logger.error(error.stack);

            switch (error.message) {
                case exception.NO_DAILY_WEATHER:
                    return next(
                        createError(
                            sc.BAD_REQUEST,
                            '해당 위치의 Daily Weather가 존재하지않음'
                        )
                    );
                case exception.DUPLICATION_WEATHY:
                    return next(
                        createError(
                            sc.BAD_REQUEST,
                            '잘못된 날짜에 Weathy 작성(중복된 웨디 작성)'
                        )
                    );
                case exception.NO_AUTHORITY:
                    return next(
                        createError(
                            sc.BAD_REQUEST,
                            'Autority Error: Clothes 권한 없음'
                        )
                    );
                default:
                    return next(createError(sc.INTERNAL_SERVER_ERROR));
            }
        }
    },

    modifyWeathy: async (req, res, next) => {
        const { weathyId } = req.params;
        const { code, clothes, stampId, feedback } = req.body;
        const userId = req.userId;

        try {
            const checkOwnerClothes = await weathyService.checkOwnerClothes(
                clothes,
                userId
            );

            if (!checkOwnerClothes) {
                return next(
                    createError(
                        sc.NO_AUTHORITY,
                        '옷에 대한 접근 권한이 없습니다.'
                    )
                );
            }

            const weathy = await weathyService.modifyWeathy(
                weathyId,
                userId,
                code,
                clothes,
                stampId,
                feedback || null
            );

            if (!weathy) throw Error(exception.NO_AUTHORITY);

            return res.status(sc.OK).json({
                message: '웨디 기록 수정 완료'
            });
        } catch (err) {
            switch (err.message) {
                case exception.NO_DAILY_WEATHER:
                    return next(
                        createError(
                            sc.BAD_REQUEST,
                            'Daily weather 데이터가 존재하지 않습니다.'
                        )
                    );
                case exception.NO_AUTHORITY:
                    return next(
                        createError(
                            sc.BAD_REQUEST,
                            '웨디를 수정할 수 없습니다.'
                        )
                    );
                default:
                    return next(createError(sc.INTERNAL_SERVER_ERROR));
            }
        }
    },

    deleteWeathy: async (req, res, next) => {
        const { weathyId } = req.params;
        const userId = req.userId;

        try {
            const deletedWeathy = await weathyService.deleteWeathy(
                weathyId,
                userId
            );

            if (!deletedWeathy) return res.status(sc.NO_CONTENTS).json({});

            return res.status(sc.OK).json({
                message: '웨디 기록 삭제 성공'
            });
        } catch (err) {
            switch (err) {
                default:
                    return next(createError(sc.INTERNAL_SERVER_ERROR));
            }
        }
    }
};
