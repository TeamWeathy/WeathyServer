const assert = require('assert');
const { Clothes, Weathy } = require('../../models');
const {
    getClothesByUserId,
    addClothesByUserId,
    deleteClothesByUserId,
    getClothesNumByUserId,
    getClothesByWeathyId
} = require('../../services/clothesService');
const { createWeathy, deleteWeathy } = require('../../services/weathyService');

describe('clothesService test', function () {
    describe('getClothesNumByUserId test', () => {
        // uses userId = 450 (Has only original clothes: 12 clothes)
        const userId = 450;
        it('getClothesNumByUserId returns clothesNum', async () => {
            const firstClothesNum = await getClothesNumByUserId(userId);
            assert.strictEqual(firstClothesNum, 12);

            // add one clothes for test
            const testClothesName = 'Test_Cl';
            await addClothesByUserId(userId, 1, testClothesName);
            const secondClothesNum = await getClothesNumByUserId(userId);
            assert.strictEqual(secondClothesNum, 13);

            // delete the clothes
            const testClothes = await Clothes.findOne({
                where: {
                    user_id: userId,
                    name: testClothesName
                }
            });
            const clothesList = new Array();
            clothesList.push(testClothes.id);
            await deleteClothesByUserId(userId, clothesList);
            const thirdClothesNum = await getClothesNumByUserId(userId);
            assert.strictEqual(thirdClothesNum, 12);
        });
    });

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

    describe('getClothesByWeathyID test', () => {
        const userId = 450;
        const testClothesName = 'testC';
        let testWeathyId, testClothesId;
        before('Add Clothes -> Record Weathy -> Delete Clothes', async () => {
            await addClothesByUserId(userId, 1, testClothesName);
            const testClothes = await Clothes.findOne({
                where: {
                    user_id: userId,
                    name: testClothesName
                }
            });
            testClothesId = testClothes.id;
            const recordedClothesList = [5035, 5040, 5043];
            recordedClothesList.push(testClothesId);

            await createWeathy(1, recordedClothesList, 3, userId, 'TEST');

            const testWeathy = await Weathy.findOne({
                where: {
                    user_id: userId,
                    dailyWeather_id: 1
                }
            });
            testWeathyId = testWeathy.id;

            const testClothesList = new Array();
            testClothesList.push(testClothesId);

            await deleteClothesByUserId(userId, testClothesList);
        });

        after('Delete Clothes and Weathy', async () => {
            await deleteWeathy(testWeathyId, userId);
        });

        it('getClothesByWeathyId should store clothes deleted after record', async () => {
            const closet = await getClothesByWeathyId(userId, testWeathyId);
            assert.strictEqual(closet.top.clothes[0].id, testClothesId);
            assert.strictEqual(closet.top.clothes[0].name, testClothesName);
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
