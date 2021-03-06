const createError = require('http-errors');
const exception = require('../modules/exception');
const statusCode = require('../modules/statusCode');
const { clothesService } = require('../services');
const { unionTwoCloset } = require('../services/clothesService');

module.exports = {
    getClothes: async (req, res, next) => {
        const { userId } = req.params;
        const { weathy_id: weathyId } = req.query;

        if (!userId) {
            next(createError(400));
        }

        try {
            let closet = await clothesService.getClothesByUserId(userId);

            if (weathyId) {
                const weathyCloset = await clothesService.getClothesByWeathyId(
                    userId,
                    weathyId
                );
                closet = unionTwoCloset(closet, weathyCloset);
            }
            res.status(statusCode.OK).json({
                closet: closet,
                message: '옷 정보 조회 성공'
            });
            next();
        } catch (error) {
            switch (error.message) {
                default:
                    next(createError(500));
            }
        }
    },
    addClothes: async (req, res, next) => {
        const { userId } = req.params;
        const { weathy_id: weathyId } = req.query;
        const { category, name } = req.body;

        if (!userId || !category || !name) {
            next(createError(400));
        }

        try {
            await clothesService.addClothesByUserId(userId, category, name);
            let closet = await clothesService.getClothesByUserId(userId);
            if (weathyId) {
                const weathyCloset = await clothesService.getClothesByWeathyId(
                    userId,
                    weathyId
                );
                closet = unionTwoCloset(closet, weathyCloset);
            }

            res.status(statusCode.OK).json({
                closet,
                message: '옷 추가 성공'
            });
            next();
        } catch (error) {
            console.log(error.message);
            switch (error.message) {
                case exception.ALREADY_CLOTHES:
                    next(createError(403));
                    break;
                default:
                    next(createError(500));
            }
        }
    },
    deleteClothes: async (req, res, next) => {
        const { userId } = req.params;
        const { clothes } = req.body;

        if (!userId || !clothes) {
            next(createError(400));
        }

        try {
            const closet = await clothesService.deleteClothesByUserId(
                userId,
                clothes
            );

            res.status(statusCode.OK).json({
                closet: closet,
                message: '옷 삭제 성공'
            });
            next();
        } catch (error) {
            console.log(error.message);
            switch (error.message) {
                case exception.NO_CLOTHES:
                    next(createError(400));
                    break;
                case exception.NOT_AUTHORIZED_CLOTHES:
                    next(createError(403));
                    break;
                default:
                    console.log(error.message);
                    next(createError(500));
            }
        }
    }
};
