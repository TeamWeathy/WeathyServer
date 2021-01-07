const assert = require('assert');
const dayjs = require('dayjs');
const { Token } = require('../../models');
const {
    isValidToken,
    refreshTokenOfUser
} = require('../../services/tokenService');

describe('tokenService test', function () {
    describe('isValidToken Test', function () {
        it('check valid token', async () => {
            assert.ok(await isValidToken(1, '1:aa'));
        });
    });

    describe('refreshTokenOfUser test', function () {
        let token, firstTime, firstToken, secondTime, secondToken;
        before('refresh token', async () => {
            token = await Token.findOne({ where: { user_id: 1 } });
            firstTime = dayjs(token.updated_at);
            firstToken = token.token;
            await refreshTokenOfUser(1);
            token = await Token.findOne({ where: { user_id: 1 } });
            secondToken = token.token;
            secondTime = dayjs(token.updated_at);
        });

        after('put token value to the original one', () => {
            Token.update({ token: '1:aa' }, { where: { user_id: 1 } });
        });

        it('token value should be updated', () => {
            assert.ok(firstToken !== secondToken);
        });

        it('token update_at should be updated', () => {
            assert.ok(firstTime !== secondTime);
        });
    });
});
