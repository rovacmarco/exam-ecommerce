const User = require('../models/userSchema');
const bcrypt = require('bcryptjs');

let loginController = async (req, res) => {
  try {
    const rawEmail = req.body.email;
    const password = req.body.password;
    const email = rawEmail ? String(rawEmail).trim().toLowerCase() : '';

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required!' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found with this email!' });
    }

    const isMatch = await bcrypt.compare(String(password), user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password!' });
    }

    res.status(200).json({
      success: 'Login successful!',
      userName: user.name,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = loginController;
