const assert = require('assert');
const { Token, Clothes } = require('../../models');
const {
    getClothesByUserId,
    addClothesByUserId,
    deleteClothesByUserId
} = require('../../services/clothesService');
const exception = require('../../modules/exception');

describe('clothesService test', function () {
    describe('getClothesByUserId test', () => {
        let closet, userId;
        before('get closet', async () => {
            userId = 35;
            const token = await Token.findOne({ where: { user_id: userId } });
            const userToken = token.token;

            closet = await getClothesByUserId(userToken, userId);
        });

        it('getClothesByUserId returns closet', async () => {
            assert.strictEqual(closet.top[0].id, userId);
            assert.strictEqual(closet.top[0].categoryId, 1);
            assert.strictEqual(closet.top[0].name, '옷1');
            assert.strictEqual(closet.bottom[0].categoryId, 2);
            assert.strictEqual(closet.bottom[0].name, '바지1');
        });

        it('if there is no clothes in outer, returns []', async () => {
            assert.deepStrictEqual(closet.outer, []);
        });
    });

    let userId, category, number, name;
    userId = 35;
    category = 1;

    describe('addClothesByUserId test', () => {
        it('First addition of clothes', async () => {
            const token = await Token.findOne({ where: { user_id: userId } });
            const userToken = token.token;

            number = Math.floor(Math.random() * 100000);
            name = '옷' + number;

            await addClothesByUserId(userToken, userId, category, name);
            const addedClothes = await Clothes.findOne({
                where: { category_id: category, name: name }
            });

            assert.ok(addedClothes !== null);
        });

        it('Second addition makes exception ALREADY_CLOTHES', async () => {
            const token = await Token.findOne({ where: { user_id: userId } });
            const userToken = token.token;

            assert.ok(async () => {
                await addClothesByUserId(userToken, userId, category, name);
            }, exception.ALREADY_CLOTHES);
        });
    });

    let clothes = new Array();
    describe('deleteClothesByUserId test', () => {
        it('First deletion of clothes', async () => {
            const token = await Token.findOne({ where: { user_id: userId } });
            const userToken = token.token;

            const deletedBeforeClothes = await Clothes.findOne({
                where: { user_id: userId, category_id: category, name: name }
            });
            const deletedId = deletedBeforeClothes.id;
            clothes.push(deletedId);

            await deleteClothesByUserId(userToken, userId, clothes);

            const deletedAfterClothes = await Clothes.findOne({
                where: {
                    user_id: userId,
                    category_id: category,
                    name: name,
                    is_deleted: 0
                }
            });

            assert.strictEqual(deletedAfterClothes, null);
        });

        it('Second deletion makes exception NO_CLOTHES', async () => {
            const token = await Token.findOne({ where: { user_id: userId } });
            const userToken = token.token;

            assert.ok(async () => {
                await deleteClothesByUserId(userToken, userId, clothes);
            }, exception.NO_CLOTHES);
        });

        it('When deleting other user clothes, makes exception NOT_AUTHORIZED_CLOTHES', async () => {
            const wrongUserId = userId + 1;
            const token = await Token.findOne({
                where: { user_id: wrongUserId }
            });
            const userToken = token.token;

            assert.ok(async () => {
                await deleteClothesByUserId(userToken, wrongUserId, clothes);
            }, exception.NOT_AUTHORIZED_CLOTHES);
        });
    });
});
