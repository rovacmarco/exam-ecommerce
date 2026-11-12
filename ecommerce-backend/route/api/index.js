const express = require('express');
const router = express.Router();

const registrationRoute = require('./authRoutes/registration');
const loginRoute = require('./authRoutes/login');
const forgetPasswordRoute = require('./authRoutes/forgetpassword');
const otpRoute = require('./authRoutes/otp');
const productRoutes = require('./productRoutes');
const orderRoutes = require('./orderRoutes');
const dashboardRoutes = require('./dashboardRoutes');

router.use('/auth', registrationRoute);
router.use('/auth', loginRoute);
router.use('/auth', forgetPasswordRoute);
router.use('/auth', otpRoute);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/', dashboardRoutes);

module.exports = router;
