const cryptoRandomString = require('crypto-random-string');
const { User, Token } = require('../models');
const exception = require('../modules/exception');
const { isValidTokenById } = require('../services/tokenService');
const { createDefaultClothes } = require('../services/clothesService');

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
        // 이미 같은 uuid를 가진 유저가 있는지 확인
        const alreadyUser = await User.findOne({
            where: {
                uuid
            }
        });
        if (alreadyUser != null) {
            // 이미 같은 uuid를 가진 유저가 있음
            throw Error(exception.ALREADY_USER);
        }

        const user = await User.create({
            nickname,
            uuid
        });

        await createDefaultClothes(user.id);
        return user;
    },
    modifyUserById: async (token, userId, nickname) => {
        // token과 userId로 valid한지 체크하고, nickname으로 변경
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
    }
};
