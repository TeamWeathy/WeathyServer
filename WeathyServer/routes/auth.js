const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { tokenUpdate } = require('../modules/tokenMiddleware');

router.post('/login', authController.login, tokenUpdate);

module.exports = router;
