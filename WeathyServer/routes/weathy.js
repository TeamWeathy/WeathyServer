const express = require('express');
const router = express.Router();

const weathyController = require('../controllers/weathyController');
const { validateToken, updateToken } = require('../modules/tokenMiddleware');

router.get('/', validateToken, weathyController.getWeathy, updateToken);
router.post('/', validateToken, weathyController.createWeathy, updateToken);
router.put(
    '/:weathyId',
    validateToken,
    weathyController.modifyWeathy,
    updateToken
);
router.delete(
    '/:weathyId',
    validateToken,
    weathyController.deleteWeathy,
    updateToken
);
module.exports = router;
