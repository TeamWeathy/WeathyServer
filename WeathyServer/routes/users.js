var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController');
const clothesController = require('../controllers/clothesController');
const calendarController = require('../controllers/calendarController');

router.post('/', userController.createUser);
router.put('/:userId', userController.modifyUser);
router.get('/:userId/clothes', clothesController.getClothes);
router.post('/:userId/clothes', clothesController.addClothes);
router.delete('/:userId/clothes', clothesController.deleteClothes);
router.get('/:userId/calendar', calendarController.getCalendarOverviews);

module.exports = router;
