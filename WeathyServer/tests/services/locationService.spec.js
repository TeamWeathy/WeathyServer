const assert = require('assert');
const { locationService } = require('../../services');
const exception = require('../../modules/exception');

describe('location service test', function () {
    describe('getLocationByCode test', function () {
        it('getLocationById returns location', async function () {
            const location = await locationService.getLocationByCode(
                1100000000
            );
            assert.strictEqual(location.code, 1100000000);
            assert.strictEqual(location.name, '서울특별시');
        });
        it('getLocationById throws error if not exists', async function () {
            await assert.rejects(async () => {
                await locationService.getById(0);
            }, exception.NO_DATA);
        });
    });
    describe('getLocationsByKeyword', function () {
        it('getLocationsByKeyword returns locations', async function () {
            const locations = await locationService.getLocationsByKeyword(
                '서울'
            );
            assert.strictEqual(locations.length, 26);
        });
        it('getLocationsByKeyword returns empty array if not exists', async function () {
            const locations = await locationService.getLocationsByKeyword(
                '김자현'
            );
            assert.strictEqual(locations.length, 0);
        });
    });
    describe('getCode test', function () {
        it('getCode returns code', async function () {
            const code = await locationService.getCode(
                37.57037778,
                126.98164166666668
            );
            assert.strictEqual(code, 1111000000);
        });
        it('getCode throws error if not exists', async function () {
            await assert.ok(async () => {
                await locationService.getCode(-1, -1);
            }, exception.SERVER_ERROR);
        });
    });
});
