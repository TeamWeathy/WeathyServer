const express = require('express');
const router = express.Router();

const weathyController = require('../controllers/weathyController');
const tokenMiddleware = require('../modules/tokenMiddleware');

router.get('/', tokenMiddleware, weathyController.getWeathy);
router.post('/', tokenMiddleware, weathyController.createWeathy);
router.put('/:weathyId', tokenMiddleware, weathyController.modifyWeathy);
router.delete('/:weathyId', tokenMiddleware, weathyController.deleteWeathy);
module.exports = router;
