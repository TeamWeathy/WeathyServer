const assert = require('assert');
const dateUtils = require('../../utils/dateUtils');
const { weatherService } = require('../../services');
const exception = require('../../modules/exception');

const assertDailyWeather = (dailyWeather) => {
    assert.strictEqual(dailyWeather.date.month, 1);
    assert.strictEqual(dailyWeather.date.day, 1);
    assert.strictEqual(dailyWeather.date.dayOfWeek, '금요일');
    assert.strictEqual(dailyWeather.temperature.maxTemp, -100);
    assert.strictEqual(dailyWeather.temperature.minTemp, 100);
};

const assertDailyWeatherWithClimate = (dailyWeather) => {
    assert.strictEqual(dailyWeather.date.month, 1);
    assert.strictEqual(dailyWeather.date.day, 1);
    assert.strictEqual(dailyWeather.date.dayOfWeek, '금요일');
    assert.strictEqual(dailyWeather.temperature.maxTemp, -100);
    assert.strictEqual(dailyWeather.temperature.minTemp, 100);
    assert.strictEqual(dailyWeather.climate.iconId, 1);
};

const assertHourlyWeather = (hourlyWeather) => {
    assert.strictEqual(hourlyWeather.time, '오후 12시');
    assert.strictEqual(hourlyWeather.temperature, 10);
    assert.strictEqual(hourlyWeather.climate.iconId, 2);
    assert.strictEqual(hourlyWeather.pop, 0);
};

describe('weather service test', function () {
    describe('getDailyWeather test', function () {
        it('getDailyWeather returns dailyWeather', async function () {
            const dailyWeather = await weatherService.getDailyWeather(
                1100000000,
                '2021-01-01'
            );
            assertDailyWeather(dailyWeather);
        });
        it('getDailyWeather returns null if not exists', async function () {
            const dailyWeather = await weatherService.getDailyWeather(
                1100000000,
                '2020-01-01'
            );
            assert(dailyWeather == null);
        });
    });
    describe('getDailyWeatherWithClimate test', function () {
        it('getDailyWeatherWithClimate returns dailyWeatherWithClimate', async function () {
            const dailyWeather = await weatherService.getDailyWeatherWithClimate(
                1100000000,
                '2021-01-01'
            );
            assertDailyWeatherWithClimate(dailyWeather);
        });
        it('getDailyWeatherWithClimate returns null if not exists', async function () {
            const dailyWeather = await weatherService.getDailyWeatherWithClimate(
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
            assertHourlyWeather(hourlyWeather);
        });
        it('getHourlyWeather returns null if not exists', async function () {
            const dailyWeather = await weatherService.getDailyWeather(
                1100000000,
                '2020-01-01'
            );
            assert(dailyWeather == null);
        });
    });
    describe('getOverviewWeather test', function () {
        it('getOverviewWeather returns overviewWeather', async function () {
            const overviewWeather = await weatherService.getOverviewWeather(
                1100000000,
                '2021-01-01',
                12,
                dateUtils.format12
            );
            assert.strictEqual(overviewWeather.region.code, 1100000000);
            assert.strictEqual(overviewWeather.region.name, '서울특별시');
            assertDailyWeather(overviewWeather.dailyWeather);
            assertHourlyWeather(overviewWeather.hourlyWeather);
        });
        it('getOverviewWeather returns null if not exists', async function () {
            const overviewWeather = await weatherService.getOverviewWeather(
                1100000000,
                '2020-01-01',
                12,
                dateUtils.format12
            );
            assert(overviewWeather == null);
        });
    });
    describe('getOverviewWeathers test', function () {
        it('getOverviewWeathers returns overviewWeatherList', async function () {
            const overviewWeatherList = await weatherService.getOverviewWeathers(
                '서울특별시',
                '2021-01-01',
                12,
                dateUtils.format12
            );
            assert.strictEqual(overviewWeatherList.length, 1);
            assertDailyWeather(overviewWeatherList[0].dailyWeather);
            assertHourlyWeather(overviewWeatherList[0].hourlyWeather);
        });
        it('getOverviewWeathers returns empty list if not exists', async function () {
            const overviewWeatherList = await weatherService.getOverviewWeathers(
                '김자현',
                '2021-01-01',
                12,
                dateUtils.format12
            );
            assert.strictEqual(overviewWeatherList.length, 0);
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
