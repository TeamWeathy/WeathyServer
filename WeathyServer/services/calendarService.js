const { DailyWeather, Weathy } = require('../models');
const Sequelize = require('sequelize');
const { literal } = require('sequelize');

module.exports = {
    getValidCalendarOverviewList: async (userId, startDate, endDate) => {
        const Op = Sequelize.Op;
        const weathies = await Weathy.findAll({
            include: [
                {
                    model: DailyWeather,
                    attributes: ['date', 'temperature_max', 'temperature_min'],
                    where: {
                        date: {
                            [Op.and]: {
                                [Op.gte]: startDate,
                                [Op.lte]: endDate
                            }
                        }
                    }
                }
            ],
            where: {
                user_id: userId
            },
            order: literal('DailyWeather.date ASC')
        });
        let validCalendarOverviewList = [];
        for (let i = 0; i < weathies.length; ++i) {
            const weathy = weathies[i];
            validCalendarOverviewList.push({
                id: weathy.id,
                date: weathy.DailyWeather.date,
                stampId: weathy.emoji_id,
                temperature: {
                    maxTemp: weathy.DailyWeather.temperature_max,
                    minTemp: weathy.DailyWeather.temperature_min
                }
            });
        }
        return validCalendarOverviewList;
    }
};
