const createError = require('http-errors');
const { Token } = require('../models');
const exception = require('../modules/exception');
const statusCode = require('../modules/statusCode');
const { userService } = require('../services');

module.exports = {
    login: async (req, res, next) => {
        const { uuid } = req.body;

        if (!uuid) {
            next(createError(400));
        }
        try {
            const user = await userService.getUserByAccount(uuid);
            const userToken = await Token.findOne({
                where: { user_id: user.id }
            });
            const token = userToken.token;
            res.locals.tokenValue = token;
            res.status(statusCode.OK).json({
                user: {
                    id: user.id,
                    nickname: user.nickname
                },
                token: token,
                message: '로그인 성공'
            });
            next();
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
