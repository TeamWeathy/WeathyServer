const createError = require('http-errors');
const sc = require('../modules/statusCode');
const weathyService = require('../services/weathyService');
const dayjs = require('dayjs');

const weatherService = require('../services/weatherService');
const exception = require('../modules/exception');
const logger = require('winston');

const { uploadS3 } = require('../modules/uploadFile');

module.exports = {
    getRecommendedWeathy: async (req, res, next) => {
        const { code, date } = req.query;
        const { userId } = req.params;
        const dateRegex = /^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[0-1])$/;

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
                res.status(sc.NO_CONTENTS).json({});
                next();
            } else {
                res.status(sc.OK).json({
                    ...recommendedWeathy,
                    message: '추천 웨디 조회 성공'
                });
                next();
            }
        } catch (error) {
            switch (error.message) {
                default:
                    return next(createError(sc.INTERNAL_SERVER_ERROR));
            }
        }
    },

    getWeathy: async (req, res, next) => {
        const { date } = req.query;
        const userId = res.locals.userId;
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
                res.status(sc.NO_CONTENTS).json({});
                next();
            } else {
                res.status(sc.OK).json({
                    ...weathy,
                    message: '웨디 기록 조회 성공'
                });
                next();
            }
        } catch (error) {
            switch (error.message) {
                default:
                    next(createError(sc.INTERNAL_SERVER_ERROR));
            }
        }
    },

    createWeathy: async (req, res, next) => {
        try {
            if (!req.body.weathy) throw Error(exception.BAD_REQUEST);

            const weathyParams = JSON.parse(req.body.weathy);
            const {
                date,
                code,
                clothes,
                stampId,
                feedback,
                userId
            } = weathyParams;
            const dateRegex = /^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[0-1])$/;
            const isExistFile = req.file ? true : false;
            const resUserId = res.locals.userId;
            let imgUrl;

            if (!dateRegex.test(date) || !code || !clothes || !stampId)
                throw Error(exception.BAD_REQUEST);

            if (resUserId !== userId) {
                return next(
                    createError(
                        sc.INVALID_ACCOUNT,
                        'Token userId and body userId mismatch'
                    )
                );
            }

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

            if (await weathyService.isDuplicateWeathy(userId, dailyWeatherId))
                throw Error(exception.DUPLICATION_WEATHY);

            if (isExistFile) imgUrl = await uploadS3(userId, req.file.buffer);

            const weathyId = await weathyService.createWeathy(
                dailyWeatherId,
                clothes,
                stampId,
                userId,
                feedback || null,
                imgUrl || null
            );

            res.status(sc.OK).json({
                message: '웨디 기록 성공',
                weathyId
            });
            next();
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
                case exception.BAD_REQUEST:
                    return next(createError(sc.BAD_REQUEST, 'Parameter Error'));

                default:
                    return next(createError(sc.INTERNAL_SERVER_ERROR));
            }
        }
    },

    modifyWeathy: async (req, res, next) => {
        try {
            if (!req.body.weathy) throw Error(exception.BAD_REQUEST);

            const weathyParams = JSON.parse(req.body.weathy);
            const { weathyId } = req.params;
            const { code, clothes, stampId, feedback, isDelete } = weathyParams;
            const isExistFile = req.file ? true : false;
            const userId = res.locals.userId;

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

            if (isExistFile && !isDelete) {
                //수정 시
                const imgUrl = await uploadS3(userId, req.file.buffer);
                await weathyService.modifyImgField(imgUrl, weathyId, userId);
            } else if (!isExistFile && isDelete) {
                //삭제 시
                await weathyService.modifyImgField(null, weathyId, userId);
            }

            res.status(sc.OK).json({
                message: '웨디 기록 수정 완료'
            });
            next();
        } catch (err) {
            logger.error(err.stack);
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
                case exception.DUPLICATION_WEATHY:
                    return next(
                        createError(
                            sc.BAD_REQUEST,
                            '잘못된 날짜에 Weathy 작성(중복된 웨디 작성)'
                        )
                    );
                case exception.BAD_REQUEST:
                    return next(createError(sc.BAD_REQUEST, 'Parameter Error'));
                case exception.CANNOT_UPLOAD_FILE:
                    return next(
                        createError(
                            sc.INTERNAL_SERVER_ERROR,
                            'Cannot upload File'
                        )
                    );
                default:
                    return next(createError(sc.INTERNAL_SERVER_ERROR));
            }
        }
    },

    deleteWeathy: async (req, res, next) => {
        const { weathyId } = req.params;
        const userId = res.locals.userId;

        try {
            const deletedWeathy = await weathyService.deleteWeathy(
                weathyId,
                userId
            );

            if (!deletedWeathy) {
                res.status(sc.NO_CONTENTS).json({});
                next();
            } else {
                res.status(sc.OK).json({
                    message: '웨디 기록 삭제 성공'
                });
                next();
            }
        } catch (err) {
            switch (err) {
                default:
                    return next(createError(sc.INTERNAL_SERVER_ERROR));
            }
        }
    }
};
