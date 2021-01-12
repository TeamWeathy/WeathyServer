const createError = require('http-errors');

const dayjs = require('dayjs');
const { Token } = require('../models');
const sc = require('./statusCode');
const exception = require('./exception');

const TOKEN_EXPIRES_IN_HOURS = 1; // 토큰 유효 기간 (100일)

//이런식 미들웨어로 변경 => 논의
const checkTokenExpired = async (token) => {
    // token이 expired 되었는지 확인
    const updatedTime = dayjs(token.updated_at);
    const expirationTime = updatedTime.add(TOKEN_EXPIRES_IN_HOURS, 'h');

    const now = dayjs(new Date());

    if (now.isBefore(expirationTime)) {
        return false;
    } else {
        return true;
    }
};

const getUserIdByToken = async (token) => {
    // sequalizer에서 token으로 user_id 가져오기 expired 되었는지도 확인
    const userToken = await Token.findOne({ where: { token: token } });
    if (userToken === null) {
        throw Error(exception.INVALID_TOKEN);
    } else if (await checkTokenExpired(userToken)) {
        throw Error(exception.EXPIRED_TOKEN);
    } else {
        return userToken.user_id;
    }
};

const tokenMiddleware = async (req, res, next) => {
    // read the token from header
    const token = req.headers['x-access-token'];
    // token does not exist
    if (!token) {
        next(createError(sc.BAD_REQUEST));
    }
    const getUserId = async (token) => {
        try {
            const userId = await getUserIdByToken(token);
            return userId;
        } catch (error) {
            next(createError(sc.BAD_REQUEST, 'Token Error'));
        }
    };

    req.userId = await getUserId(token);

    next();
};

module.exports = tokenMiddleware;