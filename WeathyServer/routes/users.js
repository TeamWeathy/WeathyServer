var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController');
const calendarController = require('../controllers/calendarController');

router.post('/', userController.createUser);
router.put('/:userId', userController.modifyUser);
router.get('/:userId/calendar', calendarController.getCalendarOverviews);

module.exports = router;
