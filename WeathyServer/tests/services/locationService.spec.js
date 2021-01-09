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
});
