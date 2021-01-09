const assert = require('assert');
const dateUtils = require('../../utils/dateUtils');
const { weatherService } = require('../../services');
const exception = require('../../modules/exception');

describe('weather service test', function () {
    describe('getDailyWeather test', function () {
        it('getDailyWeather returns dailyWeather', async function () {
            const dailyWeather = await weatherService.getDailyWeather(
                1100000000,
                '2021-01-01'
            );
            assert.strictEqual(dailyWeather.date.month, 1);
            assert.strictEqual(dailyWeather.date.day, 1);
            assert.strictEqual(dailyWeather.date.dayOfWeek, '금요일');
            assert.strictEqual(dailyWeather.temperature.maxTemp, -100);
            assert.strictEqual(dailyWeather.temperature.minTemp, 100);
        });
        it('getDailyWeather returns null if not exists', async function () {
            const dailyWeather = await weatherService.getDailyWeather(
                1100000000,
                '2020-01-01'
            );
            assert(dailyWeather == null);
        });
    });
    describe('getHourlyWeather test', function () {
        it('getHourlyWeather returns hourlyWeather', async function () {
            const hourlyWeather = await weatherService.getHourlyWeather(
                1100000000,
                '2021-01-01',
                12,
                dateUtils.format12
            );
            assert.strictEqual(hourlyWeather.time, '오후 12시');
            assert.strictEqual(hourlyWeather.temperature, 10);
            assert.strictEqual(hourlyWeather.climate.iconId, 2);
            assert.strictEqual(hourlyWeather.pop, 0);
        });
        it('getHourlyWeather returns null if not exists', async function () {
            const dailyWeather = await weatherService.getDailyWeather(
                1100000000,
                '2020-01-01'
            );
            assert(dailyWeather == null);
        });
    });

    describe('getExtraDailyWeather test', function () {
        it('getExtraDailyWeather returns extraWeather', async function () {
            const extraWeather = await weatherService.getExtraDailyWeather(
                1100000000,
                '2021-01-01'
            );
            assert(extraWeather.rain.value == 10);
            assert(extraWeather.humidity.value == 10);
            assert(extraWeather.wind.value == 91.9);
        });
        it('getExtraDailyWeather throw error if not exists', async function () {
            await assert.ok(async () => {
                await weatherService.getExtraDailyWeather(-2, '2020-01-01');
            }, exception.NO_DATA);
        });
    });
});
