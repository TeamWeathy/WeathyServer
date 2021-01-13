const { Location } = require('../models');
const Sequelize = require('sequelize');
const exception = require('../modules/exception');
const request = require('request-promise');
const apiKey = require('../config/kakao.json')['apiKey'];

module.exports = {
    getCode: async (lat, lng) => {
        let response;
        try {
            response = await request.get(
                'https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=' +
                    lng +
                    '&y=' +
                    lat,
                {
                    headers: {
                        Authorization: apiKey
                    },
                    json: true
                }
            );
        } catch (err) {
            throw Error(exception.SERVER_ERROR);
        }

        for (let i = 0; i < response.documents.length; ++i) {
            if (response.documents[i].region_type == 'H') {
                return parseInt(response.documents[i].code / 100000) * 100000;
            }
        }
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
            },
            attributes: [['id', 'code'], 'name']
        });
        return locations;
    }
};
