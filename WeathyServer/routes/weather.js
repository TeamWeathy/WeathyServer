var express = require('express');
var router = express.Router();
var weatherController = require('../controllers/weatherController');

router.get('/overview', weatherController.getWeatherByLocation);
router.get('/forecast/hourly', weatherController.getHourlyWeatherForecast);
router.get('/forecast/daily', weatherController.getDailyWeatherForecast);
router.get('/daily/extra', weatherController.getExtraDailyWeather);
router.get('/overviews', weatherController.getWeathersByKeyword);

module.exports = router;
