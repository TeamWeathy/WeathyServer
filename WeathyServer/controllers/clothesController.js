const createError = require('http-errors');
const exception = require('../modules/exception');
const statusCode = require('../modules/statusCode');
const { clothesService } = require('../services');

module.exports = {
    getClothes: async (req, res, next) => {
        const { userId } = req.params;
        const { weathyid } = req.query;
        const clothesNum = await clothesService.getClothesNumByUserId(userId);

        if (!userId) {
            next(createError(400));
        }

        try {
            if (!weathyid) {
                const closet = await clothesService.getClothesByUserId(userId);
                res.status(statusCode.OK).json({
                    clothesNum: clothesNum,
                    closet: closet,
                    message: '옷 정보 조회 성공'
                });
                next();
            } else {
                const closet = await clothesService.getClothesByWeathyId(
                    userId,
                    weathyid
                );
                res.status(statusCode.OK).json({
                    clothesNum: clothesNum,
                    closet: closet,
                    message: '옷 정보 조회 성공'
                });
                next();
            }
        } catch (error) {
            switch (error.message) {
                default:
                    next(createError(500));
            }
        }
    },
    addClothes: async (req, res, next) => {
        const { userId } = req.params;
        const { category, name } = req.body;

        if (!userId || !category || !name) {
            next(createError(400));
        }

        try {
            const clothesList = await clothesService.addClothesByUserId(
                userId,
                category,
                name
            );
            const clothesNum = await clothesService.getClothesNumByUserId(
                userId
            );

            res.status(statusCode.OK).json({
                clothesNum: clothesNum,
                clothesList: clothesList,
                message: '옷 추가 성공'
            });
            next();
        } catch (error) {
            console.log(error.message);
            switch (error.message) {
                case exception.ALREADY_CLOTHES:
                    next(createError(400));
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
            const clothesNum = await clothesService.getClothesNumByUserId(
                userId
            );
            res.status(statusCode.OK).json({
                clothesNum: clothesNum,
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
