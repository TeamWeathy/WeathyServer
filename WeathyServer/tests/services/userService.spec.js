const assert = require('assert');
const { User, Clothes } = require('../../models');
const exception = require('../../modules/exception');
const {
    getUserByAccount,
    createUserByUuid,
    modifyUserById
} = require('../../services/userService');

describe('userService test', function () {
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
            const clothes = await Clothes.findOne({
                where: { user_id: firstUser.id, name: '티셔츠' }
            });
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
            const userId = 1;
            const nickname = 'yeonsang';
            await modifyUserById(userId, nickname);
            const user = await User.findOne({ where: { id: 1 } });
            assert.ok(user.nickname === 'yeonsang');
        });
    });
});
