const express = require('express');
const router = express.Router();

const weathyController = require('../controllers/weathyController');
const tokenMiddleware = require('../modules/tokenMiddleware');
router.get('/', tokenMiddleware, weathyController.getWeathy);
module.exports = router;
