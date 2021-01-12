const assert = require('assert');
const { User, Token, Clothes } = require('../../models');
const exception = require('../../modules/exception');
const {
    getUserByAccount,
    createUserByUuid,
    modifyUserById
} = require('../../services/userService');

let originalTokenValue;
describe('userService test', function () {
    before('save original token value, and change to test value', async () => {
        const originalToken = await Token.findOne({ where: { id: 1 } });
        originalTokenValue = originalToken.token;
        await Token.update({ token: '1:aa' }, { where: { user_id: 1 } });
    });

    after('change to original token value', async () => {
        await Token.update(
            { token: originalTokenValue },
            { where: { user_id: 1 } }
        );
    });

    describe('getUserByAccount Test', () => {
        it('verify that user is obtained by uuid correctly', async () => {
            const uuid = 'test';
            const firstUser = await getUserByAccount(uuid);
            const secondUser = await User.findOne({ where: { id: 1 } });
            assert.ok(firstUser.id === secondUser.id);
            assert.ok(firstUser.nickname === secondUser.nickname);
        });

        it('if there is no user, exception NO_USER', async () => {
            const uuid = 'thisisnotuser';
            assert.ok(async () => {
                await getUserByAccount(uuid);
            }, exception.NO_USER);
        });
    });

    describe('createUserByUuid Test', () => {
        it('user should be correctly created', async () => {
            const number = Math.floor(Math.random() * 100000);
            const uuid = 'Test' + number;
            const nickname = 'Test';
            const firstUser = await createUserByUuid(uuid, nickname);
            const secondUser = await User.findOne({ order: [['id', 'DESC']] });
            assert.ok(firstUser.id === secondUser.id);
            assert.ok(firstUser.nickname === secondUser.nickname);
            const clothes = await Clothes.findOne({ where: { user_id: firstUser.id, name: '티셔츠' }});
            assert.ok(clothes !== null);
        });

        it('if already uuid exists, exception ALRLEADY_USER', async () => {
            const uuid = 'test';
            const nickname = 'usertest';
            assert.ok(async () => {
                await createUserByUuid(uuid, nickname);
            }, exception.ALREADY_USER);
        });

    });

    let originalNickname;
    describe('modifyUserById Test', () => {
        before('save original nickname', async () => {
            const user = await User.findOne({ where: { id: 1 } });
            originalNickname = user.nickname;
        });

        after('put nickname to original', async () => {
            await User.update(
                { nickname: originalNickname },
                { where: { id: 1 } }
            );
        });

        it('user nickname should be changed', async () => {
            const token = '1:aa';
            const userId = 1;
            const nickname = 'yeonsang';
            await modifyUserById(token, userId, nickname);
            const user = await User.findOne({ where: { id: 1 } });
            assert.ok(user.nickname === 'yeonsang');
        });
    });
});
