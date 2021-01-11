var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController');

const weathyController = require('../controllers/weathyController');
const clothesController = require('../controllers/clothesController');
const tokenMiddleware = require('../modules/tokenMiddleware');

router.post('/', userController.createUser);
router.put('/:userId', userController.modifyUser);
router.get('/:userId/clothes', clothesController.getClothes);
router.post('/:userId/clothes', clothesController.addClothes);
router.delete('/:userId/clothes', clothesController.deleteClothes);
router.get(
    '/:userId/weathy/recommend',
    tokenMiddleware,
    weathyController.getRecommendedWeathy
);

module.exports = router;
