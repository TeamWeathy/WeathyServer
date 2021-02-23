const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { updateToken } = require('../modules/tokenMiddleware');

router.post('/login', authController.login, updateToken);

module.exports = router;
