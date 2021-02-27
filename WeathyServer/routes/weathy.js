const express = require('express');
const router = express.Router();

const weathyController = require('../controllers/weathyController');
const { validateToken, updateToken } = require('../modules/tokenMiddleware');
const multer = require('multer');

router.get('/', validateToken, weathyController.getWeathy, updateToken);
router.post(
    '/',
    validateToken,
    multer().single('img'),
    weathyController.createWeathy,
    updateToken
);
router.put(
    '/:weathyId',
    validateToken,
    multer().single('img'),
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
