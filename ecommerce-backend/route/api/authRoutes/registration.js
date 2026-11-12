const express = require('express');
const router = express.Router();
const registrationController = require('../../../controllers/registrationController');
const secureApi = require('../../../middlewars/secureapi');

router.post('/register', secureApi, registrationController);
router.post('/registration', secureApi, registrationController);

module.exports = router;
