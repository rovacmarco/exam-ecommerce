const express = require('express');
const router = express.Router();
const { forgetPasswordController, resetPasswordController } = require('../../../controllers/forgetPasswordController');

router.post('/forgetpassword', forgetPasswordController);
router.post('/resetpassword', resetPasswordController);

module.exports = router;