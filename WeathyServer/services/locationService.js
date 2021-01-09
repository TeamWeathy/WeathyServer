const { Location } = require('../models');
const Sequelize = require('sequelize');
const exception = require('../modules/exception');

module.exports = {
    getCode: async (lat, lng) => {
        // TODO: 카카오 통신
        return 1100000000;
    },
    getLocationByCode: async (code) => {
        const location = await Location.findOne({ where: { id: code } });
        if (!location) {
            throw Error(exception.NO_DATA);
        }
        return {
            code: location.id,
            name: location.name
        };
    },
    getLocationsByKeyword: async (keyword) => {
        const Op = Sequelize.Op;
        const locations = await Location.findAll({
            where: {
                name: {
                    [Op.like]: '%' + keyword + '%'
                }
            }
        });
        return locations;
    }
};
