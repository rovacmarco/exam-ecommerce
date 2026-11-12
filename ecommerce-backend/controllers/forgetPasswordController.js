const User = require('../models/userSchema');
const bcrypt = require('bcryptjs');
const sendEmail = require('../helpers/emailVerification');

let forgetPasswordController = async (req, res) => {
  try {
    const rawEmail = req.body.email;
    const email = rawEmail ? String(rawEmail).trim().toLowerCase() : '';

    if (!email) {
      return res.status(400).json({ error: 'Email is required!' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found!' });
    }

    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = resetOtp;
    await user.save();

    try {
      await sendEmail(
        email,
        'Password Reset OTP',
        `Hello ${user.name},\n\nYour password reset OTP is: ${resetOtp}`,
        resetOtp
      );
    } catch (mailError) {
      console.error('Email sending failed:', mailError.message);
      console.log(`[OTP DEBUG] Password Reset OTP for ${email}: ${resetOtp}`);
      return res.status(500).json({
        error: `Failed to send Gmail OTP: ${mailError.message}`
      });
    }

    res.status(200).json({ success: 'Password reset OTP sent to your email!', emailSent: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

let resetPasswordController = async (req, res) => {
  try {
    const rawEmail = req.body.email;
    const otp = req.body.otp ? String(req.body.otp).trim() : '';
    const newPassword = req.body.newPassword;
    const email = rawEmail ? String(rawEmail).trim().toLowerCase() : '';

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required!' });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long!' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.otp || user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP or email!' });
    }

    const hashedPassword = await bcrypt.hash(String(newPassword), 10);
    user.password = hashedPassword;
    user.otp = null;
    user.isVerified = true;
    await user.save();

    res.status(200).json({ success: 'Password updated successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { forgetPasswordController, resetPasswordController };
