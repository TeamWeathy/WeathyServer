const assert = require('assert');
const dayjs = require('dayjs');
const { Token } = require('../../models');
const {
    isValidTokenById,
    isValidToken,
    refreshTokenOfUser
} = require('../../services/tokenService');
const exception = require('../../modules/exception');

let originalTokenValue;

describe('tokenService test', function () {
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
    describe('isValidTokenById Test', function () {
        it('check valid token by id', async () => {
            assert.ok(await isValidTokenById(1, '1:aa'));
            assert.ok(async () => {
                await isValidTokenById(1, '1:a');
            }, exception.MISMATCH_TOKEN);
        });
    });

    describe('isValidToken test', function () {
        it('check valild token', async () => {
            assert.ok(await isValidToken('1:aa'));
            assert.ok(async () => {
                await isValidToken('1:a');
            }, exception.MISMATCH_TOKEN);
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

        it('token value should be updated', () => {
            assert.ok(firstToken !== secondToken);
        });

        it('token update_at should be updated', () => {
            assert.ok(firstTime !== secondTime);
        });
    });
});
