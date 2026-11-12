const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/userSchema');

async function seedDefaultAdmin() {
  try {
    const adminEmail = 'admin@novacommerce.com';
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await User.create({
        name: 'Store Admin',
        email: adminEmail,
        password: hashedPassword,
        isVerified: true,
        otp: null
      });
      console.log('Default admin user created: admin@novacommerce.com');
    }
  } catch (err) {
    console.error('Admin seed check failed:', err.message);
  }
}

function dbConnection() {
  mongoose.connect(process.env.MONGODB_URL)
    .then(async () => {
      console.log('Database connected successfully!');
      await seedDefaultAdmin();
    })
    .catch((err) => {
      console.log('Database connection failed:', err);
    });
}

module.exports = dbConnection;
