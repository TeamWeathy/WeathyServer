var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController');
const weathyController = require('../controllers/weathyController');

const tokenMiddleware = require('../modules/tokenMiddleware');

router.post('/', userController.createUser);
router.put('/:userId', userController.modifyUser);
router.get(
    '/:userId/weathy/recommend',
    tokenMiddleware,
    weathyController.getRecommendedWeathy
);

module.exports = router;
