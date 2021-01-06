var express = require('express');
var router = express.Router();
var authController = require('../controllers/authController');

router.post('/', authController.login);

module.exports = router;