const dayjs = require('dayjs');
const { Op, literal, UniqueConstraintError } = require('sequelize');
const { format12 } = require('../utils/dateUtils');
const {
    Weathy,
    DailyWeather,
    sequelize,
    WeathyClothes,
    Clothes
} = require('../models');
const locationService = require('./locationService');
const weatherService = require('./weatherService');
const exception = require('../modules/exception');

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
    const condition3 = todayClimateId % 100 === pastClimateId % 100 ? 1 : 0;

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

async function checkOwnerClothes(clothes, userId) {
    const clothesIdSet = new Set();

    const clothesList = await Clothes.findAll({
        where: {
            user_id: userId
        },
        attributes: ['id']
    });
    for (let c of clothesList) {
        clothesIdSet.add(c.id);
    }

    for (let c of clothes) {
        if (!clothesIdSet.has(c)) return false;
    }

    return true;
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
        0,
        format12
    );

    dailyWeather.region = await locationService.getLocationByCode(code);

    weathy.dailyWeather = dailyWeather;
    weathy.hourlyWeather = hourlyWeather;

    if (!hourlyWeather) {
        return null;
    }

    return {
        weathy: {
            dailyWeather,
            hourlyWeather: {
                climate: hourlyWeather.climate,
                pop: hourlyWeather.pop
            },
            closet: {},
            weathyId: weathy.id,
            stampId: weathy.emoji_id,
            feedback: weathy.description
        }
    };
}

async function createWeathy(
    dailyWeatherId,
    clothes,
    stampId,
    userId,
    feedback
) {
    const t = await sequelize.transaction();

    try {
        const weathy = await Weathy.create(
            {
                user_id: userId,
                dailyweather_id: dailyWeatherId,
                emoji_id: stampId,
                description: feedback
            },
            { transaction: t }
        );

        for (let c of clothes) {
            await WeathyClothes.create(
                {
                    weathy_id: weathy.id,
                    clothes_id: c
                },
                { transaction: t }
            );
        }

        await t.commit();
    } catch (err) {
        await t.rollback();

        if (err instanceof UniqueConstraintError) {
            throw Error(exception.DUPLICATION_WEATHY);
        }

        throw Error(exception.SERVER_ERROR);
    }
}

async function deleteWeathy(weathyId, userId) {
    try {
        const deletedWeathy = await Weathy.destroy({
            where: {
                user_id: userId,
                id: weathyId
            }
        });

        return deletedWeathy;
    } catch (err) {
        console.log(err);
    }
}

async function modifyWeathy(
    weathyId,
    userId,
    code,
    clothes,
    stampId,
    feedback
) {
    const t = await sequelize.transaction();

    try {
        const target = await Weathy.findOne(
            {
                include: [
                    {
                        model: DailyWeather,
                        required: true,
                        attributes: ['id', 'date']
                    }
                ],
                where: {
                    id: weathyId,
                    user_id: userId
                }
            },
            { transaction: t }
        );

        if (!target) {
            return null;
        }

        const dailyWeatherDate = target.DailyWeather.date;
        const dailyWeather = await DailyWeather.findOne(
            {
                where: {
                    date: dailyWeatherDate,
                    location_id: code
                }
            },
            { transaction: t }
        );

        if (!dailyWeather) {
            throw Error(exception.NO_DAILY_WEATHER);
        }

        await Weathy.update(
            {
                dailyweather_id: dailyWeather.id,
                emoji_id: stampId,
                description: feedback
            },
            {
                where: {
                    user_id: userId,
                    id: weathyId
                }
            },
            { transaction: t }
        );

        await WeathyClothes.destroy(
            {
                where: {
                    weathy_id: weathyId
                }
            },
            { transaction: t }
        );

        for (let c of clothes) {
            await WeathyClothes.create(
                {
                    weathy_id: weathyId,
                    clothes_id: c
                },
                { transaction: t }
            );
        }

        await t.commit();
        return true;
    } catch (err) {
        await t.rollback();

        if (err.message === exception.NO_DAILY_WEATHER) {
            throw Error(exception.NO_DAILY_WEATHER);
        }
        throw Error(exception.SERVER_ERROR);
    }
}

module.exports = {
    getRecommendedWeathy,
    getWeathy,
    createWeathy,
    deleteWeathy,
    modifyWeathy,
    checkOwnerClothes
};
