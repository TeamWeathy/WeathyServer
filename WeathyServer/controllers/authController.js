const createError = require('http-errors');
const { User } = require('../models');
const exception = require('../modules/exception');
const statusCode = require('../modules/statusCode');
const { userService, tokenService } = require('../services');

module.exports = {
    login: async (req, res, next) => {
        const { uuid } = req.body;
        let user_id;
        try {
            user_id = await userService.getUserByAccount(uuid);
        } catch (error) {
            switch (error.message) {
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

        const token = await tokenService.refreshTokenOfUser(user_id);
        const user = await User.findOne({ where: { id: user_id } });
        return res.status(statusCode.OK).json({
            user: user,
            token: token,
            message: '로그인 성공'
        });
    }
};
