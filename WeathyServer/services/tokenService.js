const dayjs = require('dayjs');
const { Token } = require('../models');
const { generateToken, isUserOwnerOfToken } = require('../utils/tokenUtils');
const exception = require('../modules/exception');

const TOKEN_EXPIRES_IN_YEARS = 1;

const checkTokenExpired = async (token) => {
    // token이 expired 되었는지 확인
    const updatedTime = dayjs(token.updated_at);
    const expirationTime = updatedTime.add(TOKEN_EXPIRES_IN_YEARS, 'y');

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

const isValidToken = async (token) => {
    const id = await getUserIdByToken(token);
    return id == token.split(':')[0];
};

module.exports = {
    isValidTokenById: async (user_id, token) => {
        const id = await getUserIdByToken(token);
        return id == user_id && token.split(':')[0] == user_id;
    },
    validateTokenWithUserId: async (userId, token) => {
        if (!(await isValidToken(token))) {
            throw Error(exception.INVALID_TOKEN);
        } else if (!isUserOwnerOfToken(userId, token)) {
            throw Error(exception.MISMATCH_TOKEN);
        }
    },
    refreshTokenValueOfUser: async (user_id) => {
        const token = generateToken(user_id);
        // Sequalizer에서 Token 업데이트 하는 코드 추가
        console.log('tokenService/refreshTokenValue:::' + token);
        //await Token.update({ token: token }, { where: { user_id: user_id } });
        const testToken = await Token.findOne({ where: { user_id: user_id } });
        console.log('After update:::' + testToken.token);
        return token;
    },
    refreshTokenTimeOfUser: async (user_id) => {
        const userToken = await Token.findOne({ where: { user_id: user_id } });
        const token = userToken.token;
        const fakeToken = generateToken(user_id);
        await Token.update(
            { token: fakeToken },
            { where: { user_id: user_id } }
        );
        await Token.update({ token: token }, { where: { user_id: user_id } });
        return token;
    },
    createTokenOfUser: async (user_id) => {
        const token = generateToken(user_id);
        await Token.create({
            user_id: user_id,
            token: token
        });
        return token;
    }
};
