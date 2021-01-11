var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController');
var clothesController = require('../controllers/clothesController');

router.post('/', userController.createUser);
router.put('/:userId', userController.modifyUser);
router.get('/:userId/clothes', clothesController.getClothes);
router.post('/:userId/clothes', clothesController.addClothes);
router.delete('/:userId/clothes', clothesController.deleteClothes);

module.exports = router;
