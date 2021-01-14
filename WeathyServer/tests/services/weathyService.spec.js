const assert = require('assert');
const dateUtils = require('../../utils/dateUtils');
const weathyService = require('../../services/weathyService');
const exception = require('../../modules/exception');
const { Weathy, WeathyClothes, DailyWeather } = require('../../models');

const assertRegion = (region) => {
    assert.strictEqual(region.code, 1100000000);
    assert.strictEqual(region.name, '서울특별시');
};

const assertDailyWeather = (dailyWeather) => {
    assert.strictEqual(dailyWeather.date.month, 1);
    assert.strictEqual(dailyWeather.date.day, 1);
    assert.strictEqual(dailyWeather.date.dayOfWeek, '금요일');

    assert.strictEqual(dailyWeather.temperature.maxTemp, -100);
    assert.strictEqual(dailyWeather.temperature.minTemp, 100);
};

const assertHourlyWeather = (hourlyWeather) => {
    assert.strictEqual(hourlyWeather.climate.iconId, 2);
    assert.strictEqual(hourlyWeather.pop, 0);
};

const assertClosetWeather = (closet) => {
    assert.strictEqual(closet.top.categoryId, 1);
    assert.strictEqual(closet.bottom.categoryId, 2);
    assert.strictEqual(closet.outer.categoryId, 3);
    assert.strictEqual(closet.etc.categoryId, 4);
};

const assertWeathy = ({ weathy }) => {
    assertRegion(weathy.region);
    assertDailyWeather(weathy.dailyWeather);
    assertHourlyWeather(weathy.hourlyWeather);
    assertClosetWeather(weathy.closet);

    assert.strictEqual(weathy.weathyId, 32);
    assert.strictEqual(weathy.stampId, 2);
    assert.strictEqual(weathy.feedback, 'Good');
};

describe('weathy service test', function () {
    describe('getdWeathy test', function () {
        it('getWeathy returns Weathy', async function () {
            const weathy = await weathyService.getWeathy('2021-01-01', 1);
            assertWeathy(weathy);
        });

        it('getDailyWeather returns null', async function () {
            const weathy = await weathyService.getWeathy('3000-01-01', 1);
            assert(weathy === null);
        });
    });
    describe('getWeathy test', function () {
        it('getRecommendedWeathy returns recommened weathy', async function () {
            const weathy = await weathyService.getRecommendedWeathy(
                2647000000,
                '2021-01-11',
                1
            );
            const answerWeathy = await weathyService.getWeathy('2021-01-10', 1);

            assert.ok(weathy.id == answerWeathy.id);
        });

        it('getRecommendedWeathy returns null', async function () {
            const weathy = await weathyService.getRecommendedWeathy(
                1100000000,
                '3000-01-01',
                1
            );

            assert.ok(weathy === null);
        });
    });
    describe('createWeathy test', function () {
        it('createWeathy Success case test ', async function () {
            const weathyId = await weathyService.createWeathy(
                200,
                [5, 6],
                3,
                1
            );
            const answerWeathy = await Weathy.findOne({
                where: {
                    id: weathyId
                }
            });

            assert.ok(answerWeathy.id === weathyId);

            await Weathy.destroy({
                where: {
                    id: weathyId
                },
                paranoid: false
            });
        });
        it('createWeathy Duplicate Fail case test ', async function () {
            let weathyId;
            try {
                weathyId = await weathyService.createWeathy(200, [5, 6], 3, 1);
                await weathyService.createWeathy(200, [5, 6], 3, 1);
                assert.fail();
            } catch (err) {
                assert.ok(err.message === exception.DUPLICATION_WEATHY);
            } finally {
                await Weathy.destroy({
                    where: {
                        id: weathyId
                    },
                    paranoid: false
                });
            }
        });
    });

    describe('deleteWeathy test', function () {
        it('deleteWeathy Success case test ', async function () {
            const userId = 1;
            const weathyId = await weathyService.createWeathy(
                200,
                [5, 6],
                3,
                userId
            );

            await weathyService.deleteWeathy(weathyId, userId);

            const weathy = await Weathy.findOne({
                where: {
                    id: weathyId,
                    user_id: userId
                }
            });
            const result = await WeathyClothes.findAndCountAll({
                where: {
                    weathy_id: weathyId
                }
            });

            assert.ok(weathy === null);
            assert.ok(result.count === 0);
        });
    });

    describe('modifyWeathy test', function () {
        const userId = 1;
        const code = 1111000000;
        let weathyId;

        before('Create Weathy', async () => {
            weathyId = await weathyService.createWeathy(200, [5, 6], 3, userId);
        });

        after('Delete Weathy', async () => {
            await Weathy.destroy({
                where: {
                    id: weathyId
                },
                paranoid: false
            });
        });

        it('modifyWeathy Success case test ', async function () {
            await weathyService.modifyWeathy(
                weathyId,
                userId,
                code,
                [6],
                1,
                'feedback was changed'
            );

            const modifedWeathy = await Weathy.findOne({
                include: [
                    {
                        model: DailyWeather,
                        required: true,
                        attributes: ['location_id']
                    }
                ],
                where: {
                    id: weathyId,
                    user_id: userId
                }
            });

            const result = await WeathyClothes.findAndCountAll({
                where: {
                    weathy_id: weathyId
                }
            });

            assert.ok(modifedWeathy.description === 'feedback was changed');
            assert.ok(modifedWeathy.emoji_id === 1);
            assert.ok(modifedWeathy.DailyWeather.location_id === code);
            assert.ok(result.count === 1);
        });
    });
});
