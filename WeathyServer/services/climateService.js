const { Climate, ClimateMessage } = require('../models');
const exception = require('../modules/exception');

const getIconId = async (climate_id) => {
    const climate = await Climate.findOne({ where: { id: climate_id } });
    if (!climate) {
        throw Error(exception.NO_DATA);
    }
    return climate.icon_id;
};

const getTemperatureLevel = (temperature) => {
    let idx = parseInt(temperature / 10) + 3;
    idx = Math.max(1, idx);
    idx = Math.min(6, idx);
    return idx;
};

const getWeatherGroup = (climate_id, temperature) => {
    climate_id %= 100;
    if (climate_id == 1) {
        return getTemperatureLevel(temperature);
    } else if (climate_id == 2 || climate_id == 3) {
        return 6 + getTemperatureLevel(temperature);
    } else if (climate_id == 4) {
        return 12 + getTemperatureLevel(temperature);
    } else if (climate_id == 9 || climate_id == 10) {
        return 19;
    } else if (climate_id == 11) {
        return 20;
    } else if (climate_id == 13) {
        return 21;
    } else if (climate_id == 50) {
        return 22;
    }
    throw Error(exception.NO_DATA);
};

const getDescription = async (climate_id, temperature) => {
    const weather_group = await getWeatherGroup(climate_id, temperature);
    const climateMessages = await ClimateMessage.findAll({
        where: { weather_group: weather_group }
    });
    if (climateMessages.length == 0) {
        throw Error(exception.NO_DATA);
    }

    const rand = Math.random();
    const idx = Math.floor(rand * climateMessages.length);
    return climateMessages[idx].description;
};

const getClimateByIconId = async (id) => {
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
module.exports = {
    getClimate: async (id, temperature) => {
        const icon_id = await getIconId(id);
        const description = await getDescription(id, temperature);
        return {
            iconId: icon_id,
            description: description
        };
    },
    getIconId,
    getClimateByIconId
};
