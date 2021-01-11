const createError = require('http-errors');
const exception = require('../modules/exception');
const statusCode = require('../modules/statusCode');
const { userService, tokenService } = require('../services');

module.exports = {
    login: async (req, res, next) => {
        const { uuid } = req.body;

        if (!uuid) {
            next(createError(400));
        }

        try {
            const user = await userService.getUserByAccount(uuid);
            const token = await tokenService.refreshTokenOfUser(user.id);

            return res.status(statusCode.OK).json({
                user: {
                    id: user.id,
                    nickname: user.nickname
                },
                token: token,
                message: '로그인 성공'
            });
        } catch (error) {
            switch (error.message) {
                case exception.NO_USER:
                    next(createError(401));
                    break;
                default:
                    next(createError(500));
            }
        }
    }
};
