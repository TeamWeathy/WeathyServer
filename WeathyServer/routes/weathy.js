const express = require('express');
const router = express.Router();

const weathyController = require('../controllers/weathyController');
const { tokenCheck, tokenUpdate } = require('../modules/tokenMiddleware');

router.get('/', tokenCheck, weathyController.getWeathy, tokenUpdate);
router.post('/', tokenCheck, weathyController.createWeathy, tokenUpdate);
router.put(
    '/:weathyId',
    tokenCheck,
    weathyController.modifyWeathy,
    tokenUpdate
);
router.delete(
    '/:weathyId',
    tokenCheck,
    weathyController.deleteWeathy,
    tokenUpdate
);
module.exports = router;
