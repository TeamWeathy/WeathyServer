var express = require('express');
var router = express.Router();
var weatherController = require('../controllers/weatherController');

router.get('/weather/overview', weatherController.getWeatherByLocation);
router.get(
    '/weather/forecast/hourly',
    weatherController.getHourlyWeatherForcast
);
