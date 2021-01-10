const { Climate } = require('../models');
const exception = require('../modules/exception');

module.exports = {
    getById: async (id) => {
        const climate = await Climate.findOne({ where: { id: id } });
        if (!climate) {
            throw Error(exception.NO_DATA);
        }
        return {
            iconId: climate.icon_id,
            description: climate.description
        };
    }
};
