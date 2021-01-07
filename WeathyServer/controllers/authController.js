const createError = require('http-errors');
const { User } = require('../models');
const exception = require('../modules/exception');
const statusCode = require('../modules/statusCode');
const { userService, tokenService } = require('../services');

module.exports = {
    login: async (req, res, next) => {
        const { uuid } = req.body;

        try {
            const userId = await userService.getUserByAccount(uuid);
            const token = await tokenService.refreshTokenOfUser(userId);
            const user = await User.findOne({ where: { id: userId } });
            return res.status(statusCode.OK).json({
                user: user,
                token: token,
                message: '로그인 성공'
            });
        } catch (error) {
            switch (error.message) {
                case exception.NO_USER:
                    next(createError(400));
                    break;
                case exception.INVALID_TOKEN:
                    next(createError(403));
                    break;
                case exception.EXPIRED_TOKEN:
                    next(createError(403));
                    break;
                default:
                    next(createError(500));
            }
        }
    }
};
