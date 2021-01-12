var express = require('express');
var router = express.Router();
<<<<<<< HEAD
var userController = require('../controllers/userController');

const weathyController = require('../controllers/weathyController');
const clothesController = require('../controllers/clothesController');
const tokenMiddleware = require('../modules/tokenMiddleware');
=======
const userController = require('../controllers/userController');
const clothesController = require('../controllers/clothesController');
const calendarController = require('../controllers/calendarController');
>>>>>>> fee40ec4a68da86fa4a20b656c665ec43abd8841

router.post('/', userController.createUser);
router.put('/:userId', userController.modifyUser);
router.get('/:userId/clothes', clothesController.getClothes);
router.post('/:userId/clothes', clothesController.addClothes);
router.delete('/:userId/clothes', clothesController.deleteClothes);
<<<<<<< HEAD
router.get(
    '/:userId/weathy/recommend',
    tokenMiddleware,
    weathyController.getRecommendedWeathy
);
=======
router.get('/:userId/calendar', calendarController.getCalendarOverviews);
>>>>>>> fee40ec4a68da86fa4a20b656c665ec43abd8841

module.exports = router;
