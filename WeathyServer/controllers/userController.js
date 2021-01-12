const createError = require('http-errors');
const exception = require('../modules/exception');
const statusCode = require('../modules/statusCode');
const { userService, tokenService } = require('../services');

module.exports = {
    createUser: async (req, res, next) => {
        const { uuid, nickname } = req.body;

        if (!uuid || !nickname) {
            next(createError(400));
        }

        try {
            const user = await userService.createUserByUuid(uuid, nickname);
            const token = await tokenService.createTokenOfUser(user.id);

            return res.status(statusCode.OK).json({
                user: {
                    id: user.id,
                    nickname: user.nickname
                },
                token: token,
                message: '유저 생성 성공'
            });
        } catch (error) {
            switch (error.message) {
                case exception.ALREADY_USER:
                    next(createError(400));
                    break;
                default:
                    next(createError(500));
            }
        }
    },
    modifyUser: async (req, res, next) => {
        const reqToken = req.get('x-access-token');
        const { userId } = req.params;
        const { nickname } = req.body;

        if (!userId || !nickname || !reqToken) {
            next(createError(400));
        }

        try {
            const user = await userService.modifyUserById(
                reqToken,
                userId,
                nickname
            );

            return res.status(statusCode.OK).json({
                user: {
                    id: user.id,
                    nickname: user.nickname
                },
                token: reqToken,
                message: '유저 닉네임 변경 성공'
            });
        } catch (error) {
            switch (error.message) {
                case exception.INVALID_TOKEN:
                case exception.EXPIRED_TOKEN:
                case exception.MISMATCH_TOKEN:
                    next(createError(401));
                    break;
                default:
                    next(createError(500));
            }
        }
    }
};
