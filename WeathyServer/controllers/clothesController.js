const createError = require('http-errors');
const exception = require('../modules/exception');
const statusCode = require('../modules/statusCode');
const { clothesService } = require('../services');

module.exports = {
    getClothes: async (req, res, next) => {
        const reqToken = req.get('x-access-token');
        const { userId } = req.params;

        if (!userId) {
            next(createError(400));
        }

        try {
            const closet = await clothesService.getClothesByUserId(
                reqToken,
                userId
            );
            return res.status(statusCode.OK).json({
                closet: closet,
                message: '옷 정보 조회 성공'
            });
        } catch (error) {
            switch (error.message) {
                case exception.INVALID_TOKEN:
                case exception.EXPIRED_TOKEN:
                case exception.MISMATCH_TOKEN:
                    next(createError(401));
                    break;
                case exception.SERVER_ERROR:
                    next(createError(500));
                    break;
                default:
                    console.log(error.message);
                    next(createError(500));
            }
        }
    },
    addClothes: async (req, res, next) => {
        const reqToken = req.get('x-access-token');
        const { userId } = req.params;
        const { category, name } = req.body;

        if (!userId || !category || !name) {
            next(createError(400));
        }

        try {
            const clothesList = await clothesService.addClothesByUserId(
                reqToken,
                userId,
                category,
                name
            );

            return res.status(statusCode.OK).json({
                clothesList: clothesList,
                message: '옷 추가 성공'
            });
        } catch (error) {
            console.log(error.message);
            switch (error.message) {
                case exception.INVALID_TOKEN:
                case exception.EXPIRED_TOKEN:
                case exception.MISMATCH_TOKEN:
                    next(createError(401));
                    break;
                case exception.SERVER_ERROR:
                    next(createError(500));
                    break;
                default:
                    console.log(error.message);
                    next(createError(500));
            }
        }
    },
    deleteClothes: async (req, res, next) => {
        const reqToken = req.get('x-access-token');
        const { userId } = req.params;
        const { clothes } = req.body;

        if (!userId || !clothes) {
            next(createError(400));
        }

        try {
            const closet = await clothesService.deleteClothesByUserId(
                reqToken,
                userId,
                clothes
            );
            return res.status(statusCode.OK).json({
                closet: closet,
                message: '옷 삭제 성공'
            });
        } catch (error) {
            switch (error.message) {
                case exception.INVALID_TOKEN:
                case exception.EXPIRED_TOKEN:
                case exception.MISMATCH_TOKEN:
                    next(createError(401));
                    break;
                case exception.SERVER_ERROR:
                    next(createError(500));
                    break;
                default:
                    console.log(error.message);
                    next(createError(500));
            }
        }
    }
};
