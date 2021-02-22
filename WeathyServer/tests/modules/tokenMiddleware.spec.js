const assert = require('assert');
const httpMocks = require('node-mocks-http');
const dayjs = require('dayjs');
const { Token } = require('../../models');
const { validateToken, updateToken } = require('../../modules/tokenMiddleware');

describe('tokenMiddleware test', function () {
    describe('validateToken test', () => {
        // testing tokens::
        // userID 22 (Should be Updated)
        // userID 21 (Should not be Updated)

        const firstTestUserId = 22;
        const secondTestUserId = 21;
        let firstTestUserToken, secondTestUserToken;

        before('get values, and update tokens used for test', async () => {
            const firstTestUserTokenObj = await Token.findOne({
                where: { user_id: firstTestUserId }
            });
            firstTestUserToken = firstTestUserTokenObj.token;
            const secondTestUserTokenObj = await Token.findOne({
                where: { user_id: secondTestUserId }
            });
            secondTestUserToken = secondTestUserTokenObj.token;

            const req = httpMocks.createRequest();
            const res = httpMocks.createResponse({
                locals: {
                    tokenValue: firstTestUserToken
                }
            });
            await updateToken(req, res);
        });

        it('If there is no token on req, throw error', async () => {
            const req = httpMocks.createRequest();
            const res = httpMocks.createResponse();

            await validateToken(req, res, (next) => {
                assert.ok(next instanceof Error);
            });
        });

        it('If there is no matching token on DB, throw error', async () => {
            const req = httpMocks.createRequest({
                headers: {
                    'x-access-token': 'THIS_IS_FAKE_TOKEN'
                }
            });
            const res = httpMocks.createResponse();

            await validateToken(req, res, (next) => {
                assert.ok(next instanceof Error);
            });
        });

        it("If param's userId and token's userId is different, throw error", async () => {
            const req = httpMocks.createRequest({
                headers: {
                    'x-access-token': firstTestUserToken
                },
                params: {
                    userId: secondTestUserId
                }
            });
            const res = httpMocks.createResponse();

            await validateToken(req, res, (next) => {
                assert.ok(next instanceof Error);
            });
        });

        it('If token is expired, throw error', async () => {
            const req = httpMocks.createRequest({
                headers: {
                    'x-access-token': secondTestUserToken
                }
            });
            const res = httpMocks.createResponse();

            await validateToken(req, res, (next) => {
                assert.ok(next instanceof Error);
            });
        });

        it('If token is valid, does not throw error (No param)', async () => {
            const req = httpMocks.createRequest({
                headers: {
                    'x-access-token': firstTestUserToken
                }
            });
            const res = httpMocks.createResponse();

            await validateToken(req, res, (next) => {
                assert.ok(!(next instanceof Error));
            });
        });

        it('If token is valid, does not throw error (Has param)', async () => {
            const req = httpMocks.createRequest({
                headers: {
                    'x-access-token': firstTestUserToken
                },
                params: {
                    userId: firstTestUserId
                }
            });
            const res = httpMocks.createResponse();

            await validateToken(req, res, (next) => {
                assert.ok(!(next instanceof Error));
            });
        });
    });

    describe('updateToken test', () => {
        // testing tokens::
        // userID 22 (Gets Updated)
        const testUserId = 22;
        let testUserToken;
        let beforeUpdatedTime;

        before('get values used for test', async () => {
            const testUserTokenObj = await Token.findOne({
                where: { user_id: testUserId }
            });
            testUserToken = testUserTokenObj.token;
            beforeUpdatedTime = dayjs(testUserTokenObj.updated_at);
        });

        it('Token should be updated', async () => {
            const req = httpMocks.createRequest();
            const res = httpMocks.createResponse({
                locals: {
                    tokenValue: testUserToken
                }
            });
            await updateToken(req, res);

            const afterTestUserTokenObj = await Token.findOne({
                where: { user_id: testUserId }
            });
            const afterUpdatedTime = dayjs(afterTestUserTokenObj.updated_at);

            assert.ok(afterUpdatedTime.isAfter(beforeUpdatedTime));
            assert.ok(beforeUpdatedTime.isBefore(afterUpdatedTime));
        });
    });
});
