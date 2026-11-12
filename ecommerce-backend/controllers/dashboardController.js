const mongoose = require('mongoose');
const User = require('../models/userSchema');
const Product = require('../models/productSchema');
const Order = require('../models/orderSchema');
const { isEmailConfigured } = require('../helpers/emailVerification');

const getHealth = (req, res) => {
  const readyState = mongoose.connection.readyState;
  const dbMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.status(200).json({
    status: 'ok',
    service: 'ecommerce-backend',
    database: dbMap[readyState] || 'unknown',
    emailConfigured: isEmailConfigured(),
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password -otp').sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const toggleVerifyUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password -otp');
    if (!user) {
      return res.status(404).json({ error: 'User not found!' });
    }
    user.isVerified = !user.isVerified;
    await user.save();
    res.status(200).json({ success: 'User verification updated!', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'User not found!' });
    }
    res.status(200).json({ success: 'User deleted successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOverviewStats = async (req, res) => {
  try {
    const [totalUsers, verifiedUsers, totalProducts, products, orders] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
      Product.countDocuments(),
      Product.find().sort({ createdAt: -1 }),
      Order.find().sort({ createdAt: -1 })
    ]);

    const totalRevenue = orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

    const lowStockProducts = products.filter((p) => p.stock <= 10);

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders: orders.length,
        totalProducts,
        totalUsers,
        verifiedUsers,
        lowStockCount: lowStockProducts.length
      },
      recentOrders: orders.slice(0, 5),
      lowStockProducts: lowStockProducts.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getHealth, getUsers, toggleVerifyUser, deleteUser, getOverviewStats };
