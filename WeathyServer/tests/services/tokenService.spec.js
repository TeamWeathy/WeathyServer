const assert = require('assert');
const dayjs = require('dayjs');
const { Token } = require('../../models');
const exception = require('../../modules/exception');
const {
    isValidTokenById,
    validateTokenWithUserId,
    refreshTokenOfUser
} = require('../../services/tokenService');

describe('tokenService test', function () {
    describe('isValidTokenById Test', function () {
        it('check valid token by id', async () => {
            assert.ok(await isValidTokenById(1, '1:aa'));
        });
    });

    describe('validateTokenWithUserId test', function () {
        it('validateTokenWithUserId success', async function () {
            await assert.ok(async () => {
                await validateTokenWithUserId(1, '1:aa');
            }, exception.INVALID_TOKEN);
        });
        it('validateTokenWithUserId throw error if token invalid', async function () {
            await assert.ok(async () => {
                await validateTokenWithUserId(1, 'INVALID_TOKEN');
            }, exception.INVALID_TOKEN);
        });
        it('validateTokenWithUserId throw error if token and user mismatched', async function () {
            await assert.ok(async () => {
                await validateTokenWithUserId(1, '1:invalidtoken');
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

        after('put token value to the original one', async () => {
            await Token.update({ token: '1:aa' }, { where: { user_id: 1 } });
        });

        it('token value should be updated', () => {
            assert.ok(firstToken !== secondToken);
        });

        it('token update_at should be updated', () => {
            assert.ok(firstTime !== secondTime);
        });
    });
});
