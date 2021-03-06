const assert = require('assert');
const dateUtils = require('../../utils/dateUtils');
const { weatherService } = require('../../services');

const assertDailyWeather = (dailyWeather) => {
    assert.strictEqual(dailyWeather.date.month, 1);
    assert.strictEqual(dailyWeather.date.day, 1);
    assert.strictEqual(dailyWeather.date.dayOfWeek, '금요일');
    assert.strictEqual(dailyWeather.temperature.maxTemp, -100);
    assert.strictEqual(dailyWeather.temperature.minTemp, 100);
};

const assertDailyWeatherWithClimateIconId = (dailyWeather) => {
    assert.strictEqual(dailyWeather.date.month, 1);
    assert.strictEqual(dailyWeather.date.day, 1);
    assert.strictEqual(dailyWeather.date.dayOfWeek, '금요일');
    assert.strictEqual(dailyWeather.temperature.maxTemp, -100);
    assert.strictEqual(dailyWeather.temperature.minTemp, 100);
    assert.strictEqual(dailyWeather.climateIconId, 1);
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
    describe('getDailyWeatherWithClimateIconId test', function () {
        it('getDailyWeatherWithClimateIconId returns dailyWeatherWithClimate', async function () {
            const dailyWeather = await weatherService.getDailyWeatherWithClimateIconId(
                1100000000,
                '2021-01-01'
            );
            assertDailyWeatherWithClimateIconId(dailyWeather);
        });
        it('getDailyWeatherWithClimateIconId returns null if not exists', async function () {
            const dailyWeather = await weatherService.getDailyWeatherWithClimateIconId(
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
        }).timeout(15000);
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
            await assert.rejects(async () => {
                await weatherService.getExtraDailyWeather(-2, '2020-01-01');
            });
        });
    });
});
