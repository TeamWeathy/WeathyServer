const createError = require('http-errors');
const dayjs = require('dayjs');
const { Token, sequelize } = require('../models');
const sc = require('./statusCode');
const exception = require('./exception');
const { generateToken, isUserOwnerOfToken } = require('../utils/tokenUtils');

const TOKEN_EXPIRES_IN_DAYS = 15; // 토큰 유효 기간 (15일)

const validateToken = async (req, res, next) => {
    // 토큰 검사
    // 1. header에 token이 있는지 확인
    const token = req.headers['x-access-token'];
    if (!token) {
        return next(createError(sc.BAD_REQUEST, 'No Token'));
    }

    // 2. 이 토큰이 유효한지 확인
    const userToken = await Token.findOne({ where: { token: token } });
    // 2-1. token 객체가 DB에 존재해야 한다
    if (userToken === null) {
        return next(createError(sc.BAD_REQUEST, 'No Matching Token on DB'));
    } else if (!isUserOwnerOfToken(userToken.user_id, token)) {
        // 2-2. 객체의 userId와 토큰에 포함된 id가 같아야 한다
        return next(createError(sc.INVALID_ACCOUNT, 'Token user_id is wrong'));
    } else {
        // 2-3. param에 userId가 있다면, 토큰에 포함된 id와 일치하는지 확인. 없으면 그냥 넘어간다
        // 가정: param에 userId가 없다면, 그 API는 param에 userId를 요구하지 않는 것이다
        // param에 userId가 있어야 하는데 없는 경우는, service 단에서 error를 처리해야 함
        const { userId } = req.params;
        if (userId && !isUserOwnerOfToken(userId, token)) {
            return next(
                createError(
                    sc.INVALID_ACCOUNT,
                    'Param userId is different with Token'
                )
            );
        }

        // 2-4. token의 만료 기한이 지나지 않았어야 한다
        const updatedTime = userToken.updatedAt;
        const updatedTimeDayjs = dayjs(updatedTime);
        const expirationTime = updatedTimeDayjs.add(
            TOKEN_EXPIRES_IN_DAYS,
            'days'
        );
        const now = dayjs(new Date());
        if (!now.isBefore(expirationTime)) {
            return next(createError(sc.INVALID_ACCOUNT, 'Expired Token'));
        }
    }

    // 3. res.locals에 token 값과 userId 저장해 둠
    res.locals.tokenValue = token;
    res.locals.userId = userToken.user_id;
    next();
};

const updateToken = async (req, res) => {
    // 토큰 업데이트
    // 사용되면 return res.send() 에서 return을 뺄 것

    try {
        const token = res.locals.tokenValue;

        const userToken = await Token.findOne({ where: { token: token } });

        userToken.changed('updatedAt', true);
        await userToken.update({ updatedAt: new Date() });

        return res;
    } catch (err) {
        console.log(err);
        throw Error(exception.SERVER_ERROR);
    }
};

module.exports = {
    validateToken,
    updateToken
};
