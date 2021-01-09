const assert = require('assert');
const { User } = require('../../models');
const {
    getUserByAccount,
    // createUserByUuid,
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
    });

    /*
    describe('createUserByUuid Test', () => {
        it('user should be correctly created', async () => {
            const uuid = 'creTest';
            const nickname = 'creTest';
            const firstUser = await createUserByUuid(uuid, nickname);
            const secondUser = await User.findOne({ order: [['id', 'DESC']] });
            assert.ok(firstUser.id === secondUser.id);
            assert.ok(firstUser.nickname === secondUser.nickname);
        });
    });
    */

    describe('modifyUserById Test', () => {
        after('put nickname to original', async () => {
            await User.update({ nickname: 'test' }, { where: { id: 1 } });
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
