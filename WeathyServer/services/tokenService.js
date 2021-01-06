const cryptoRandomString = require('crypto-random-string');
const dayjs = require('dayjs');
const { Token, User } = require('../models');
const exception = require('../modules/exception');

const EXPIRES_IN = 100; // 토큰 유효 기간 (100일)

const generateToken = () => {
    return cryptoRandomString({ length: 30, type: 'alphanumeric' });
};

const checkTokenExpired = async (token) => {
    // token이 expired 되었는지 확인
    const userToken = await Token.findOne({ where: { token: token } });
    const updatedTime = dayjs(userToken.updated_at);
    const expirationTime = updatedTime.add(EXPIRES_IN, 'd');

    const dayjsToday = dayjs(new Date());

    if (dayjsToday.isBefore(expirationTime)) {
        return false;
    } else {
        return true;
    }
};

const getUserIdByToken = async (token) => {
    // sequalizer에서 token으로 user_id 가져오기 expired 되었는지도 확인
    const userToken = await Token.findOne({ where: { token: token } });
    if (userToken == null) {
        throw Error(exception.INVALID_TOKEN);
    } else if (await checkTokenExpired(token)) {
        throw Error(exception.EXPIRED_TOKEN);
    } else {
        return userToken.user_id;
    }
};

module.exports = {
    isValidToken: async (user_id, token) => {
        const id = await getUserIdByToken(token);
        return id === user_id;
    },
    refreshTokenOfUser: async (user_id) => {
        const token = generateToken();
        // Sequalizer에서 Token 업데이트 하는 코드 추가
        await User.update({ id: user_id }, { $set: { token: token } });
    }
};
