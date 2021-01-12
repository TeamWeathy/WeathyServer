const assert = require('assert');
const { climateService } = require('../../services');
const exception = require('../../modules/exception');

describe('climate service test', function () {
    describe('getClimate test', function () {
        it('getClimateBy returns Climate test', async function () {
            const climate = await climateService.getClimate(1, 0);
            assert.ok(climate);
            assert.strictEqual(climate.iconId, 1);
        });
        it('getClimateBy returns different description every time', async function () {
            const climate_first = await climateService.getClimate(1, 0);
            const climate_second = await climateService.getClimate(1, 0);
            assert.ok(climate_first.description != climate_second.description);
        });
        it('getClimateBy throws error if not exists', async function () {
            await assert.ok(async () => {
                await climateService.getClimate(-2, 0);
            }, exception.NO_DATA);
        });
    });
});
