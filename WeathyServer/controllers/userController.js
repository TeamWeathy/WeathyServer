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

        const user = await userService.createUserByUuid(uuid, nickname);
        const token = await tokenService.refreshTokenOfUser(user.id);
        const returnUser = {
            id: user.id,
            nickname: user.nickname
        };

        return res.status(statusCode.OK).json({
            user: returnUser,
            token: token,
            message: '유저 생성 성공'
        });
    },
    modifyUser: async (req, res, next) => {
        const reqToken = req.get('x-access-token');
        const { userId } = req.params;
        const { nickname } = req.body;

        try {
            const user = await userService.modifyUserById(
                reqToken,
                userId,
                nickname
            );
            const token = await tokenService.refreshTokenOfUser(user.id);
            const returnUser = {
                id: user.id,
                nickname: user.nickname
            };
            return res.status(statusCode.OK).json({
                user: returnUser,
                token: token,
                message: '유저 닉네임 변경 성공'
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
                    next(createError(500));
            }
        }
    }
};
