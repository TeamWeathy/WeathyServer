const createError = require('http-errors');

const dayjs = require('dayjs');
const { Token } = require('../models');
const sc = require('./statusCode');
const exception = require('./exception');
const { generateToken } = require('../utils/tokenUtils');

const TOKEN_EXPIRES_IN_HOURS = 1; // 토큰 유효 기간 (1시간)

const checkTokenExpired = async (token) => {
    // token이 expired 되었는지 확인
    
    const updatedTime = dayjs(token.updatedAt);
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

const refreshTokenTimeOfUser = async (user_id) => {
    // Sequalizer에서 Token (시간만) 업데이트 하는 코드
    const userToken = await Token.findOne({ where: {user_id: user_id }});
    const token = userToken.token;
    const fakeToken = generateToken(user_id);
    await Token.update({ token: fakeToken }, { where: { user_id: user_id } });
    await Token.update({ token: token }, { where: { user_id: user_id }});
}

const getUserId = async (token) => {
       try {
           const userId = await getUserIdByToken(token);
           return userId;
       } catch (error) {
           throw Error(exception.INVALID_TOKEN);
       }
    };
    
const tokenMiddleware = async (req, res, next) => {
    // read the token from header
    const token = req.headers['x-access-token'];
    // token does not exist
    if (!token) {
        next(createError(sc.BAD_REQUEST));
    }
  
    try {
        const userId = await getUserId(token);
        req.userId = userId;
        await refreshTokenTimeOfUser(userId);
    } catch (error) {
        switch(error.message) {
            case exception.EXPIRED_TOKEN:
            case exception.INVALID_TOKEN:
                next(createError(sc.INVALID_ACCOUNT, 'Token Error'));
                break;
            default:
                next(createError(sc.INTERNAL_SERVER_ERROR, 'Server Error'));
                break;
        }
    }
    next();
};

module.exports = tokenMiddleware;
