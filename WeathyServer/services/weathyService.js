const dayjs = require('dayjs');
const { Op, literal, UniqueConstraintError } = require('sequelize');
const { format12 } = require('../utils/dateUtils');
const {
    Weathy,
    DailyWeather,
    sequelize,
    WeathyClothes,
    Clothes,
    Climate
} = require('../models');
const locationService = require('./locationService');
const weatherService = require('./weatherService');
const clothesService = require('./clothesService');
const exception = require('../modules/exception');

const calculateConditionPoint = (candidate, todayWeather) => {
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
        Math.abs(
            Math.abs(todayMaxTemp - todayMinTemp) -
                Math.abs(pastMaxTemp - pastMinTemp)
        ) * 2;
    const condition3 = todayClimateId % 100 === pastClimateId % 100 ? 1 : 0;

    return condition1 + condition2 + condition3;
};

const getWeathyOnDate = async (date, userId) => {
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
};

const selectBestDate = (todayWeather, candidates) => {
    const SUITABLE_STAMP_ID = 3;

    let weathy = {
        recommend: undefined,
        point: undefined
    };

    for (let candidate of candidates) {
        let point = calculateConditionPoint(candidate, todayWeather);

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

    if (!weathy.recommend) return null;

    return weathy.recommend.DailyWeather.date;
};

const getSuitableWeathers = (todayWeather, weathies) => {
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

        if (maxTempPoint <= 2 && minTempPoint <= 2) weathyCase[1].push(w);
        else if (maxTempPoint <= 2 || minTempPoint <= 2) weathyCase[2].push(w);
    }

    if (weathyCase[1].length !== 0) return weathyCase[1];

    return weathyCase[2];
};

const loadWeatherOnDate = async (code, date) => {
    const dailyWeather = await weatherService.getDailyWeather(code, date);
    const dailyClimateId = await weatherService.getDailyClimateId(code, date);

    if (!dailyWeather || !dailyClimateId) return null;

    const { temperature: todayTemp } = dailyWeather;
    const { climateId: todayClimateId } = dailyClimateId;

    if (!todayTemp || !todayClimateId) return null;

    return {
        todayTemp,
        todayClimateId
    };
};

const getMostSimilarDate = async (code, date, candidates) => {
    const todayWeather = await loadWeatherOnDate(code, date); //현재 지역의 날씨 로드

    if (!todayWeather) return null;

    const candidatesOfSuitableCase = getSuitableWeathers(
        todayWeather,
        candidates
    ); //적합한 case의 weathers 가져옴

    return selectBestDate(todayWeather, candidatesOfSuitableCase);
};

const upsertWeathyClothes = async (clothes, weathyId, transaction) => {
    const clothesDBForm = [];

    await WeathyClothes.destroy(
        {
            where: {
                weathy_id: weathyId
            }
        },
        { transaction }
    );

    for (let c of clothes) {
        clothesDBForm.push({
            weathy_id: weathyId,

            clothes_id: c
        });
    }

    await WeathyClothes.bulkCreate(clothesDBForm, { transaction });
};

const loadWeathiesInSixtyDays = async (date, userId) => {
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
};

const getRecommendedWeathy = async (code, date, userId) => {
    const candidates = await loadWeathiesInSixtyDays(date, userId);
    const mostSimilarDate = await getMostSimilarDate(code, date, candidates);

    if (!mostSimilarDate) return null;

    const recommendedWeathy = await getWeathy(mostSimilarDate, userId);

    return recommendedWeathy;
};

const checkOwnerClothes = async (clothes, userId) => {
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
};

const findDailyWeatherByWeathy = async (
    weathyId,
    code,
    userId,
    transaction
) => {
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
        { transaction }
    );

    if (!target) return null;

    const dailyWeatherDate = target.DailyWeather.date;
    const dailyWeather = await DailyWeather.findOne(
        {
            where: {
                date: dailyWeatherDate,
                location_id: code
            }
        },
        { transaction }
    );

    return dailyWeather;
};

const getWeathyClimate = async (id) => {
    const climate = await Climate.findOne({
        where: {
            icon_id: id
        }
    });
    const iconId = climate.icon_id;
    const description = climate.description;

    return {
        iconId,
        description
    };
};

const getWeathy = async (date, userId) => {
    const weathy = await getWeathyOnDate(date, userId);

    if (!weathy) return null;

    const { location_id: code } = weathy.DailyWeather;
    const dailyWeather = await weatherService.getDailyWeather(code, date);
    const hourlyWeather = await weatherService.getHourlyWeather(
        code,
        date,
        12,
        format12
    );

    if (!hourlyWeather) return null;

    hourlyWeather.climate = await getWeathyClimate(
        hourlyWeather.climate.iconId
    );

    const region = await locationService.getLocationByCode(code);
    const closet = await clothesService.getWeathyCloset(weathy.id);

    return {
        weathy: {
            region,
            dailyWeather,
            hourlyWeather,
            closet,
            weathyId: weathy.id,
            stampId: weathy.emoji_id,
            feedback: weathy.description || null,
            imgUrl: weathy.img_url || null
        }
    };
};

const createWeathy = async (
    dailyWeatherId,
    clothes,
    stampId,
    userId,
    feedback = null,
    imgUrl = null
) => {
    const transaction = await sequelize.transaction();

    try {
        const weathy = await Weathy.create(
            {
                user_id: userId,
                dailyweather_id: dailyWeatherId,
                emoji_id: stampId,
                description: feedback,
                img_url: imgUrl
            },
            { transaction }
        );

        await upsertWeathyClothes(clothes, weathy.id, transaction);

        await transaction.commit();
        return weathy.id;
    } catch (err) {
        await transaction.rollback();

        if (err instanceof UniqueConstraintError) {
            throw Error(exception.DUPLICATION_WEATHY);
        }

        throw Error(exception.SERVER_ERROR);
    }
};

const deleteWeathy = async (weathyId, userId) => {
    try {
        const deletedWeathy = await Weathy.destroy({
            where: {
                user_id: userId,
                id: weathyId
            }
        });

        return deletedWeathy;
    } catch (err) {
        throw Error(exception.SERVER_ERROR);
    }
};

const modifyWeathy = async (
    weathyId,
    userId,
    code,
    clothes,
    stampId,
    feedback = null
) => {
    const transaction = await sequelize.transaction();

    try {
        const dailyWeather = await findDailyWeatherByWeathy(
            weathyId,
            code,
            userId,
            transaction
        );

        if (!dailyWeather) throw Error(exception.NO_DAILY_WEATHER);

        const isUpdated = await Weathy.update(
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
            { transaction }
        );

        await upsertWeathyClothes(clothes, weathyId, transaction);

        await transaction.commit();

        return isUpdated;
    } catch (err) {
        await transaction.rollback();

        if (err.message === exception.NO_DAILY_WEATHER) {
            throw Error(exception.NO_DAILY_WEATHER);
        }
        if (err instanceof UniqueConstraintError) {
            throw Error(exception.DUPLICATION_WEATHY);
        }
        throw Error(exception.SERVER_ERROR);
    }
};

const modifyImgField = async (imgUrl = null, weathyId, userId) => {
    try {
        await Weathy.update(
            {
                img_url: imgUrl
            },
            {
                where: {
                    user_id: userId,
                    id: weathyId
                }
            }
        );
    } catch (err) {
        throw Error(exception.SERVER_ERROR);
    }
};

const isDuplicateWeathy = async (dailyWeatherId, userId) => {
    try {
        const count = await Weathy.count({
            where: {
                user_id: userId,
                dailyweather_id: dailyWeatherId
            }
        });
        if (count) return true;
        return false;
    } catch (err) {
        throw Error(exception.SERVER_ERROR);
    }
};

module.exports = {
    getRecommendedWeathy,
    getWeathy,
    createWeathy,
    deleteWeathy,
    modifyWeathy,
    checkOwnerClothes,
    modifyImgField,
    isDuplicateWeathy
};
