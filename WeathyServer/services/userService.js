const cryptoRandomString = require('crypto-random-string');
const { User, Token } = require('../models');
const exception = require('../modules/exception');
const { isValidTokenById } = require('../services/tokenService');

const generateToken = () => {
    return cryptoRandomString({ length: 30, type: 'alphanumeric' });
};

module.exports = {
    getUserByAccount: async (uuid) => {
        // uuid로 user 가져오기
        const user = await User.findOne({ where: { uuid: uuid } });
        if (user === null) {
            throw Error(exception.NO_USER);
        } else {
            return user;
        }
    },
    createUserByUuid: async (uuid, nickname) => {
        // uuid, nickname 으로 유저 생성
        const user = await User.create({
            nickname,
            uuid
        });
        const token = user.id + ':' + generateToken();
        await Token.create({
            user_id: user.id,
            token: token
        });
        return user;
    },
    modifyUserById: async (token, userId, nickname) => {
        // token과 userId로 valid한지 체크하고, nickname으로 변경
        try {
            const flag = await isValidTokenById(userId, token);
            if (!flag) {
                // 토큰이 맞지 않음. 잘못된 요청임
                throw Error(exception.MISMATCH_TOKEN);
            } else {
                await User.update(
                    { nickname: nickname },
                    { where: { id: userId } }
                );
                const user = await User.findOne({ where: { id: userId } });
                return user;
            }
        } catch (error) {
            switch (error.message) {
                // isValidTokenById 에서 받아오는 error들
                // 토큰 만료 or DB에 존재하지 않는 토큰
                case exception.EXPIRED_TOKEN:
                    throw Error(exception.EXPIRED_TOKEN);
                case exception.INVALID_TOKEN:
                    throw Error(exception.INVALID_TOKEN);
                case exception.MISMATCH_TOKEN:
                    throw Error(exception.MISMATCH_TOKEN);
                default:
                    throw Error(exception.SERVER_ERROR);
            }
        }
    }
};
