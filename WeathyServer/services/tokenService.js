const cryptoRandomString = require('crypto-random-string');
const dayjs = require('dayjs');
const { Token } = require('../models');
const exception = require('../modules/exception');

const TOKEN_EXPIRES_IN_HOURS = 1; // 토큰 유효 기간 (100일)

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

const generateToken = () => {
    return cryptoRandomString({ length: 30, type: 'alphanumeric' });
};

module.exports = {
    isValidTokenById: async (user_id, token) => {
        const id = await getUserIdByToken(token);
        return id == user_id && token.split(':')[0] == user_id;
    },
    isValidToken: async (token) => {
        const id = await getUserIdByToken(token);
        return id == token.split(':')[0];
    },
    refreshTokenOfUser: async (user_id) => {
        const token = user_id + ':' + generateToken();
        // Sequalizer에서 Token 업데이트 하는 코드 추가
        await Token.update({ token: token }, { where: { user_id: user_id } });
        return token;
    }
};