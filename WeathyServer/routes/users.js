var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController');

router.post('/', userController.createUser);
router.put('/:userId', userController.modifyUser);

module.exports = router;
