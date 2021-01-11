const dayjs = require('dayjs');
const { Op, literal } = require('sequelize');
const { format12 } = require('../utils/dateUtils');
const { Weathy, DailyWeather } = require('../models');

const locationService = require('./locationService');

const weatherService = require('./weatherService');

function getConditionPoint(candidate, todayWeather) {
    const { todayTemp, todayClimateId } = todayWeather;
    const { minTemp: todayMinTemp, maxTemp: todayMaxTemp } = todayTemp;
    const {
        temperature_min: pastMinTemp,
        temperature_max: pastMaxTemp,
        climate_id: pastClimateId
    } = candidate.DailyWeather;

    const condition1 =
        (Math.abs(todayMaxTemp - pastMaxTemp) +
            Math.abs(todayMinTemp - pastMinTemp)) *
        3;
    const condition2 =
        (Math.abs(todayMaxTemp - todayMinTemp) -
            Math.abs(pastMaxTemp - pastMinTemp)) *
        2;
    const condition3 = todayClimateId === pastClimateId ? 1 : 0;

    return condition1 + condition2 + condition3;
}

async function getWeathyOnDate(date, userId) {
    const weathy = await Weathy.findOne({
        include: [
            {
                model: DailyWeather,
                required: true,
                attributes: [
                    'temperature_max',
                    'temperature_min',
                    'climate_id',
                    'location_id',
                    'date'
                ],
                where: {
                    date
                }
            }
        ],
        where: {
            user_id: userId
        }
    });

    return weathy;
}

function selectBestDate(todayWeather, candidates) {
    const SUITABLE_STAMP_ID = 3;

    let weathy = {
        recommend: undefined,
        point: undefined
    };

    for (let candidate of candidates) {
        let point = getConditionPoint(candidate, todayWeather);

        //init
        if (!weathy.recommend) {
            weathy.recommend = candidate;
            weathy.point = point;
        }

        if (point < weathy.point) {
            weathy.recommend = candidate;
            weathy.point = point;
        } else if (
            weathy.point === point &&
            candidate.emoji_id === SUITABLE_STAMP_ID
        ) {
            weathy.recommend = candidate;
        }
    }
    if (!weathy.recommend) {
        return null;
    }

    return weathy.recommend.DailyWeather.date;
}

function getSuitableWeathers(todayWeather, weathies) {
    const { todayTemp } = todayWeather;
    const { minTemp: todayMinTemp, maxTemp: todayMaxTemp } = todayTemp;
    const weathyCase = {
        1: [],
        2: []
    };

    for (let w of weathies) {
        const {
            temperature_min: pastMinTemp,
            temperature_max: pastMaxTemp
        } = w.DailyWeather;
        const maxTempPoint = Math.abs(todayMaxTemp - pastMaxTemp);
        const minTempPoint = Math.abs(todayMinTemp - pastMinTemp);

        if (maxTempPoint <= 2 && minTempPoint <= 2) {
            weathyCase[1].push(w);
        } else if (maxTempPoint <= 2 || minTempPoint <= 2) {
            weathyCase[2].push(w);
        }
    }

    if (weathyCase[1].length !== 0) {
        return weathyCase[1];
    }

    return weathyCase[2];
}

async function loadWeatherOnDate(code, date) {
    const { temperature: todayTemp } = await weatherService.getDailyWeather(
        code,
        date
    );

    const {
        climateId: todayClimateId
    } = await weatherService.getDailyClimateId(code, date);

    if (!todayTemp || !todayClimateId) {
        return null;
    }

    return {
        todayTemp,
        todayClimateId
    };
}

async function getSimilarDate(code, date, candidates) {
    const todayWeather = await loadWeatherOnDate(code, date); //현재 지역의 날씨 로드
    if (!todayWeather) {
        return null;
    }
    const candidatesOfSuitableCase = getSuitableWeathers(
        todayWeather,
        candidates
    ); //적합한 case의 weathers 가져옴

    return selectBestDate(todayWeather, candidatesOfSuitableCase);
}

async function loadWeathiesInSixtyDays(date, userId) {
    const sixtyAgo = dayjs(date).subtract(60, 'day').format('YYYY-MM-DD');

    const weathies = await Weathy.findAll({
        include: [
            {
                model: DailyWeather,
                required: true,
                attributes: [
                    'temperature_max',
                    'temperature_min',
                    'climate_id',
                    'location_id',
                    'date'
                ],
                where: {
                    date: {
                        [Op.lt]: date,
                        [Op.gte]: sixtyAgo
                    }
                }
            }
        ],
        where: {
            user_id: userId
        },

        order: literal('DailyWeather.date ASC')
    });

    return weathies;
}

async function getRecommendedWeathy(code, date, userId) {
    const candidates = await loadWeathiesInSixtyDays(date, userId);
    const similarDate = await getSimilarDate(code, date, candidates);

    if (!similarDate) {
        return null;
    }

    const recommendedWeathy = await this.getWeathy(similarDate, userId);

    return recommendedWeathy;
}
async function getWeathy(date, userId) {
    const weathy = await getWeathyOnDate(date, userId);

    if (!weathy) {
        return null;
    }

    const updatedTime = dayjs(weathy.updatedAt);
    const { location_id: code } = weathy.DailyWeather;

    const dailyWeather = await weatherService.getDailyWeather(code, date);
    const hourlyWeather = await weatherService.getHourlyWeather(
        code,
        date,
        updatedTime.hour(),
        format12
    );

    dailyWeather.region = await locationService.getLocationByCode(code);

    weathy.dailyWeather = dailyWeather;
    weathy.hourlyWeather = hourlyWeather;

    return {
        weathy: {
            dailyWeather,
            hourlyWeather: {
                climate: hourlyWeather.climate,
                pop: hourlyWeather.pop
            },
            closet: {},
            stampId: weathy.emoji_id,
            feedback: weathy.description
        }
    };
}

module.exports = {
    getRecommendedWeathy,
    getWeathy
};
