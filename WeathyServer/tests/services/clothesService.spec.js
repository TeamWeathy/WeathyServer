const assert = require('assert');
const { Token, Clothes, User } = require('../../models');
const {
    getClothesByUserId,
    addClothesByUserId,
    deleteClothesByUserId
} = require('../../services/clothesService');

describe('clothesService test', function () {
    describe('getClothesByUserId test', () => {
        it('getClothesByUserId returns closet', async () => {
            const userId = 35;
            const token = await Token.findOne({ where: { user_id: userId } });
            const userToken = token.token;

            const closet = await getClothesByUserId(userToken, userId);
            console.log('********' + closet);

            assert.strictEqual(closet['top'].id, userId);
            assert.strictEqual(closet.top.categoryId, 1);
            assert.strictEqual(closet.top.name, '옷1');
            assert.strictEqual(closet.bottom.categoryId, 2);
            assert.strictEqual(closet.bottom.name, '바지1');
            assert.strictEqual(closet.outer, null);
        });
    });
});
