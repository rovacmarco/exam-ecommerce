const express = require('express');
const router = express.Router();
const { otpController, resendOtpController } = require('../../../controllers/otpController');

router.post('/otp', otpController);
router.post('/verify-otp', otpController);
router.post('/resend-otp', resendOtpController);

module.exports = router;
