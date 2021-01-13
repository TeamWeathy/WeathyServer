const assert = require('assert');
const dayjs = require('dayjs');
const { Token } = require('../../models');
const exception = require('../../modules/exception');
const {
    isValidTokenById,
    validateTokenWithUserId,
    refreshTokenValueOfUser,
    refreshTokenTimeOfUser,
} = require('../../services/tokenService');

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

    describe('refreshTokenValueOfUser test', function () {
        let token, firstToken, firstTime, secondToken, secondTime;
        before('refresh token', async () => {
            token = await Token.findOne({ where: { user_id: 1 } });
            firstToken = token.token;
            firstTime = dayjs(token.updated_at);
            await refreshTokenValueOfUser(1);
            token = await Token.findOne({ where: { user_id: 1 } });
            secondToken = token.token;
            secondTime = dayjs(token.updated_at);
        });

        it('token value and time should be updated', () => {
            assert.ok(firstToken !== secondToken);
            assert.ok(firstTime !== secondTime);
        });

    });

    describe('refreshTokenTimeOfUser test', function () {
        let token, firstValue, firstTime, secondValue, secondTime;
        before('refresh token', async () => {
            token = await Token.findOne({ where: { user_id: 1 } });
            firstToken = token.token;
            firstTime = dayjs(token.updated_at);
            await refreshTokenTimeOfUser(1);
            token = await Token.findOne({ where: { user_id: 1 } });
            secondToken = token.token;
            secondTime = dayjs(token.updated_at);
        });
        it('token update_at should be updated but not value', () => {
            assert.ok(firstToken === secondToken);
            assert.ok(firstTime !== secondTime);
        });
    });
});
