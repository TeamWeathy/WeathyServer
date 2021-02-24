const assert = require('assert');
const tokenUtils = require('../../utils/tokenUtils');

describe('tokenUtils test', function () {
    describe('generateToken test', function () {
        it('generateToken returns token contains userId', function () {
            const token = tokenUtils.generateToken(1);
            assert.ok(token.split(':')[0], 1);
        });

        it('generateToken returns token contains 30 length random string', function () {
            const token = tokenUtils.generateToken(1);
            assert.ok(token.split(':')[1].length, 30);
        });
    });
    describe('getUserIdFromToken test', function () {
        it('getUserIdFromToken returns userId', function () {
            const token = '1:token';
            assert.ok(tokenUtils.getUserIdFromToken(token), 1);
        });
    });
    describe('isUserOwnerOfToken test', function () {
        it('isUserOwnerOfToken returns true if userId matched', function () {
            const token = '1:token';
            assert.ok(tokenUtils.isUserOwnerOfToken(1, token));
        });
        it('isUserOwnerOfToken returns false if userId unmatched', function () {
            const token = '1:token';
            assert.ok(!tokenUtils.isUserOwnerOfToken(2, token));
        });
    });
});
