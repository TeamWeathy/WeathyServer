const express = require('express');
const router = express.Router();

const weathyController = require('../controllers/weathyController');
const { tokenCheck, tokenUpdate } = require('../modules/tokenMiddleware');
const userController = require('../controllers/userController');
const clothesController = require('../controllers/clothesController');
const calendarController = require('../controllers/calendarController');

router.post('/', userController.createUser);
router.put('/:userId', tokenCheck, userController.modifyUser, tokenUpdate);
router.get(
    '/:userId/clothes',
    tokenCheck,
    clothesController.getClothes,
    tokenUpdate
);
router.post(
    '/:userId/clothes',
    tokenCheck,
    clothesController.addClothes,
    tokenUpdate
);
router.delete(
    '/:userId/clothes',
    tokenCheck,
    clothesController.deleteClothes,
    tokenUpdate
);

router.get(
    '/:userId/weathy/recommend',
    tokenCheck,
    weathyController.getRecommendedWeathy,
    tokenUpdate
);
router.get(
    '/:userId/calendar',
    tokenCheck,
    calendarController.getCalendarOverviews,
    tokenUpdate
);

module.exports = router;
