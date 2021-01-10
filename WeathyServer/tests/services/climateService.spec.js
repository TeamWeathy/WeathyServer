const assert = require('assert');
const { climateService } = require('../../services');
const exception = require('../../modules/exception');

describe('climate service test', function () {
    describe('getClimateById test', function () {
        it('getClimateById returns Climate test', async function () {
            const climate = await climateService.getById(1);
            assert.ok(climate);
            assert.strictEqual(climate.iconId, 1);
        });
        it('getClimateById throws error if not exists', async function () {
            await assert.ok(async () => {
                await climateService.getById(-2);
            }, exception.NO_DATA);
        });
    });
});
