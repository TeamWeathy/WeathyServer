const express = require('express');
const router = express.Router();

const weathyController = require('../controllers/weathyController');
const tokenMiddleware = require('../modules/tokenMiddleware');
const { upload } = require('../modules/uploadFile');

router.get('/', tokenMiddleware, weathyController.getWeathy);
router.post(
    '/',
    tokenMiddleware,
    upload.single('img'),
    weathyController.createWeathy
);
router.put(
    '/:weathyId',
    tokenMiddleware,
    upload.single('img'),
    weathyController.modifyWeathy
);
router.delete('/:weathyId', tokenMiddleware, weathyController.deleteWeathy);
module.exports = router;
