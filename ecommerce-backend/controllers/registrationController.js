const User = require('../models/userSchema');
const bcrypt = require('bcryptjs');
const sendEmail = require('../helpers/emailVerification');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let registrationController = async (req, res) => {
  try {
    const rawEmail = req.body.email;
    const password = req.body.password;
    const rawName = req.body.name || req.body.username;

    const name = rawName ? String(rawName).trim() : '';
    const email = rawEmail ? String(rawEmail).trim().toLowerCase() : '';

    if (!name) {
      return res.status(400).json({ error: 'Name is required!' });
    }

    if (!email) {
      return res.status(400).json({ error: 'Email is required!' });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address!' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Password is required!' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long!' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email!' });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      otp,
      isVerified: false
    });

    await newUser.save();

    let emailSent = true;
    let emailError = null;
    try {
      await sendEmail(
        email,
        'Email Verification OTP',
        `Hello ${name},\n\nYour account verification OTP is: ${otp}\n\nThank you for registering!`,
        otp
      );
    } catch (mailError) {
      emailSent = false;
      emailError = mailError.message;
      console.error('Failed to send verification email:', mailError.message);
      console.log(`[OTP DEBUG] Registration OTP for ${email}: ${otp}`);
    }

    res.status(201).json({
      success: emailSent
        ? 'Registration successful! Verification OTP sent to your email.'
        : 'Account created, but Gmail OTP delivery failed. Check backend .env EMAIL_PASS.',
      emailSent,
      ...(emailError ? { emailError } : {}),
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        isVerified: newUser.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = registrationController;
