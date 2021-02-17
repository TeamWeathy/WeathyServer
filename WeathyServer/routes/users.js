const express = require('express');
const router = express.Router();

const weathyController = require('../controllers/weathyController');
const { validateToken, updateToken } = require('../modules/tokenMiddleware');
const userController = require('../controllers/userController');
const clothesController = require('../controllers/clothesController');
const calendarController = require('../controllers/calendarController');

router.post('/', userController.createUser);
router.put('/:userId', validateToken, userController.modifyUser, updateToken);
router.get(
    '/:userId/clothes',
    validateToken,
    clothesController.getClothes,
    updateToken
);
router.post(
    '/:userId/clothes',
    validateToken,
    clothesController.addClothes,
    updateToken
);
router.delete(
    '/:userId/clothes',
    validateToken,
    clothesController.deleteClothes,
    updateToken
);

router.get(
    '/:userId/weathy/recommend',
    validateToken,
    weathyController.getRecommendedWeathy,
    updateToken
);
router.get(
    '/:userId/calendar',
    validateToken,
    calendarController.getCalendarOverviews,
    updateToken
);

module.exports = router;
