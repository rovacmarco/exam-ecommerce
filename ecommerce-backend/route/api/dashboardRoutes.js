const express = require('express');
const router = express.Router();
const {
  getHealth,
  getUsers,
  toggleVerifyUser,
  deleteUser,
  getOverviewStats
} = require('../../controllers/dashboardController');

router.get('/health', getHealth);
router.get('/stats', getOverviewStats);
router.get('/users', getUsers);
router.patch('/users/:id/verify', toggleVerifyUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
