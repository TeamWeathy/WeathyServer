var express = require('express');
var router = express.Router();
var calendarController = require('../controllers/calendarController');

router.get('/users/:userId/calendar', calendarController.getCalendarOverviews);
