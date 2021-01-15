const express = require('express');
const router = express.Router();

const weathyController = require('../controllers/weathyController');
const tokenMiddleware = require('../modules/tokenMiddleware');
const userController = require('../controllers/userController');
const clothesController = require('../controllers/clothesController');
const calendarController = require('../controllers/calendarController');

router.post('/', userController.createUser);
router.put('/:userId', tokenMiddleware, userController.modifyUser);
router.get('/:userId/clothes', tokenMiddleware, clothesController.getClothes);
router.post('/:userId/clothes', tokenMiddleware, clothesController.addClothes);
router.delete(
    '/:userId/clothes',
    tokenMiddleware,
    clothesController.deleteClothes
);

router.get(
    '/:userId/weathy/recommend',
    tokenMiddleware,
    weathyController.getRecommendedWeathy
);
router.get('/:userId/calendar', calendarController.getCalendarOverviews);

module.exports = router;
