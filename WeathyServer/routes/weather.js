var express = require('express');
var router = express.Router();
var weatherController = require('../controllers/weatherController');

router.get('/weather/overview', weatherController.getWeatherByLocation);
router.get(
    '/weather/forecast/hourly',
    weatherController.getHourlyWeatherForecast
);
router.get(
    '/weather/forecast/daily',
    weatherController.getDailyWeatherForecast
);
router.get('/weather/daily/extra', weatherController.getExtraDailyWeather);
