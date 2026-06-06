const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('Email service connected and ready');
  } catch (error) {
    console.warn(`Email service not available: ${error.message}`);
    // Do NOT throw — server should still start if email is misconfigured
  }
};

module.exports = { transporter, verifyEmailConnection };
