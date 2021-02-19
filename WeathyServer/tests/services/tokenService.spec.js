const assert = require('assert');
const { Token } = require('../../models');
const { createTokenOfUser } = require('../../services/tokenService');

describe('tokenService test', function () {
    describe('createTokenOfUser test', () => {
        const testUserId = 1;
        it('token should be created by user_id', async () => {
            await createTokenOfUser(testUserId);
            const token = await Token.findOne({
                where: { user_id: testUserId }
            });
            assert.ok(token !== null);
        });

        after('Delete created token', async () => {
            await Token.destroy({
                where: { user_id: testUserId }
            });
        });
    });
});
