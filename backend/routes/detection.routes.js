const express = require('express');
const router = express.Router();
const { verifySign, getDetectionStatus } = require('../controllers/detection.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/status', getDetectionStatus);
router.post('/verify', authenticate, verifySign);

module.exports = router;