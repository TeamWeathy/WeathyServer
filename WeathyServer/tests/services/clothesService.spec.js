const assert = require('assert');
const { Clothes } = require('../../models');
const {
    getClothesByUserId,
    addClothesByUserId,
    deleteClothesByUserId
} = require('../../services/clothesService');

describe('clothesService test', function () {
    describe('getClothesByUserId test', () => {
        let closet, userId;
        before('get closet', async () => {
            userId = 35;
            closet = await getClothesByUserId(userId);
        });
        it('getClothesByUserId returns closet', async () => {
            assert.strictEqual(closet.bottom.categoryId, 2);
            assert.strictEqual(closet.bottom.clothes[0].id, 16);
            assert.strictEqual(closet.bottom.clothes[0].name, '바지1');
        });
    });

    let userId, category, number, name;
    userId = 35;
    category = 1;

    describe('addClothesByUserId test', () => {
        it('First addition of clothes', async () => {
            number = Math.floor(Math.random() * 100000);
            name = '옷' + number;

            await addClothesByUserId(userId, category, name);
            const addedClothes = await Clothes.findOne({
                where: { category_id: category, name: name }
            });

            assert.ok(addedClothes !== null);
        });

        it('Second addition makes exception ALREADY_CLOTHES', async () => {
            await assert.rejects(async () => {
                await addClothesByUserId(userId, category, name);
            });
        });
    });

    let clothes = new Array();
    describe('deleteClothesByUserId test', () => {
        it('First deletion of clothes', async () => {
            const deletedBeforeClothes = await Clothes.findOne({
                where: { user_id: userId, category_id: category, name: name }
            });
            const deletedId = deletedBeforeClothes.id;
            clothes.push(deletedId);
            await deleteClothesByUserId(userId, clothes);

            const deletedAfterClothes = await Clothes.findOne({
                where: {
                    user_id: userId,
                    category_id: category,
                    name: name,
                    is_deleted: 0
                }
            });

            assert.strictEqual(deletedAfterClothes, null);
        }).timeout(15000);

        it('Second deletion makes exception NO_CLOTHES', async () => {
            await assert.rejects(async () => {
                await deleteClothesByUserId(userId, clothes);
            });
        });

        it("When deleting other user's clothes, throws error", async () => {
            const wrongUserId = userId + 1;

            await assert.rejects(async () => {
                await deleteClothesByUserId(wrongUserId, clothes);
            });
        });
    });
});
