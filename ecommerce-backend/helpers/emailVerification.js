const nodemailer = require('nodemailer');

function isEmailConfigured() {
  const user = (process.env.EMAIL_USER || '').trim();
  const pass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '').trim();

  if (!user || !pass) return false;
  if (pass === 'abcdefghijklmnop' || pass.length < 16) return false;
  return true;
}

function createTransporter() {
  const user = (process.env.EMAIL_USER || '').trim();
  // Google App Passwords are often copied with spaces (e.g. "abcd efgh ijkl mnop")
  const pass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '').trim();

  if (!user || !pass || pass === 'abcdefghijklmnop') {
    throw new Error(
      'Gmail SMTP is not configured: replace EMAIL_PASS=abcdefghijklmnop in ecommerce-backend/.env with a valid 16-character Google App Password.'
    );
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user,
      pass
    }
  });
}

async function sendEmail(email, subject, text, otpCode = null) {
  const transporter = createTransporter();
  const user = (process.env.EMAIL_USER || '').trim();

  const html = otpCode
    ? `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 32px; border-radius: 16px; border: 1px solid #1e293b;">
        <h2 style="margin: 0 0 12px; color: #38bdf8;">NovaCommerce Security</h2>
        <p style="margin: 0 0 20px; color: #cbd5e1; font-size: 14px; line-height: 1.6;">${text.replace(/\n/g, '<br/>')}</p>
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 20px;">
          <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; margin-bottom: 6px;">Your Verification Code</span>
          <span style="font-size: 30px; font-weight: bold; letter-spacing: 8px; color: #ffffff; font-family: monospace;">${otpCode}</span>
        </div>
        <p style="margin: 0; font-size: 12px; color: #64748b;">If you did not request this code, you can safely ignore this email.</p>
      </div>
    `
    : undefined;

  try {
    return await transporter.sendMail({
      from: `"NovaCommerce" <${user}>`,
      to: email,
      subject,
      text,
      ...(html ? { html } : {})
    });
  } catch (err) {
    if (err.message && (err.message.includes('534-5.7.9') || err.message.includes('InvalidSecondFactor'))) {
      throw new Error(
        'Gmail rejected your normal password. You MUST use a 16-letter Google App Password (from myaccount.google.com/apppasswords after enabling 2-Step Verification) in ecommerce-backend/.env EMAIL_PASS.'
      );
    }
    throw err;
  }
}

module.exports = sendEmail;
module.exports.isEmailConfigured = isEmailConfigured;
