const User = require('../models/userSchema');
const sendEmail = require('../helpers/emailVerification');

let otpController = async (req, res) => {
  try {
    const rawEmail = req.body.email;
    const otp = req.body.otp ? String(req.body.otp).trim() : '';
    const email = rawEmail ? String(rawEmail).trim().toLowerCase() : '';

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required!' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found!' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Account is already verified!' });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP!' });
    }

    user.isVerified = true;
    user.otp = null;
    await user.save();

    res.status(200).json({
      success: 'Account verified successfully!',
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

let resendOtpController = async (req, res) => {
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

    if (user.isVerified) {
      return res.status(400).json({ error: 'Account is already verified!' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    await user.save();

    try {
      await sendEmail(
        email,
        'Email Verification OTP',
        `Hello ${user.name},\n\nYour new verification OTP is: ${otp}`,
        otp
      );
    } catch (mailError) {
      console.error('Email sending failed:', mailError.message);
      console.log(`[OTP DEBUG] Resend OTP for ${email}: ${otp}`);
      return res.status(500).json({
        error: `Failed to send Gmail OTP: ${mailError.message}`
      });
    }

    res.status(200).json({ success: 'New OTP generated and sent to your email!', emailSent: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { otpController, resendOtpController };
