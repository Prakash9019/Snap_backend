const User = require('../models/User');
const EmailOtp = require("../models/EmailOtp");
const Admin = require('../models/Admin');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require("google-auth-library");
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const nodemailer = require('nodemailer');

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;
const JWT_SECRET = process.env.JWT_SECRET;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '1h' });
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

exports.sendEmailOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: "Email is required" });

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await EmailOtp.deleteMany({ email });
    const emailOtp = new EmailOtp({ email, otp });
    await emailOtp.save();

    const mailOptions = {
      from: `"SnapSage Support" <${EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
      html: `<p>Your OTP code is <b>${otp}</b>. It will expire in 5 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ msg: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to send OTP email" });
  }
};

exports.verifyEmailOtp = async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ msg: "Email and OTP are required" });
  }

  try {
    const record = await EmailOtp.findOne({ email, otp: code });
    if (!record) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email });
      await user.save();
    }

    await EmailOtp.deleteMany({ email });
    const token = generateToken(user._id);
    return res.json({ msg: "OTP verified successfully", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to verify OTP" });
  }
};

exports.sendOtp = async (req, res) => {
  const { mobileNumber } = req.body;
  if (!mobileNumber) {
    return res.status(400).json({ msg: 'Mobile number is required' });
  }

  try {
    const verification = await twilioClient.verify.v2.services(TWILIO_VERIFY_SERVICE_SID)
      .verifications
      .create({ to: `+91${mobileNumber}`, channel: 'sms' });
    res.json({ msg: 'OTP sent successfully.', status: verification.status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Failed to send OTP.' });
  }
};

exports.verifyOtp = async (req, res) => {
  const { mobileNumber, code } = req.body;
  if (!mobileNumber || !code) {
    return res.status(400).json({ msg: 'Mobile number and OTP are required' });
  }

  try {
    const verificationCheck = await twilioClient.verify.v2.services(TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks
      .create({ to: `+91${mobileNumber}`, code });

    if (verificationCheck.status === 'approved') {
      let user = await User.findOne({ mobileNumber });
      if (!user) {
        user = new User({ mobileNumber });
        await user.save();
      }
      const token = generateToken(user._id);
      res.json({ msg: 'OTP verified successfully.', token });
    } else {
      res.status(400).json({ msg: 'Invalid OTP' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Failed to verify OTP.' });
  }
};


exports.registerEmail = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = new User({ name, email, password: hashedPassword });
    await user.save();
    const token = generateToken(user._id);
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
};

exports.loginEmail = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }
    const token = generateToken(user._id);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
};

exports.loginGoogle = async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub, email, name } = ticket.getPayload();

    let user = await User.findOne({ googleId: sub });
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.googleId = sub;
        await user.save();
      } else {
        user = new User({ googleId: sub, email, name });
        await user.save();
      }
    }

    const authToken = generateToken(user._id);
    res.json({ token: authToken, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Google login failed' });
  }
};

exports.adminSignup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let adminUser = await Admin.findOne({ email });
    if (adminUser) {
      return res.status(400).json({ msg: "Admin already exists" });
    }
    adminUser = new Admin({ name, email, password });
    await adminUser.save();
    const token = generateToken(adminUser._id);
    res.status(201).json({
      _id: adminUser._id,
      name: adminUser.name,
      email: adminUser.email,
      role: "admin",
      token,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const adminUser = await Admin.findOne({ email });
    if (!adminUser || !(await adminUser.matchPassword(password))) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }
    const token = generateToken(adminUser._id);
    res.json({
      _id: adminUser._id,
      name: adminUser.name,
      email: adminUser.email,
      role: "admin",
      token,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.adminForgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const adminUser = await Admin.findOne({ email });
    if (!adminUser) {
      return res.status(404).json({ msg: 'Admin not found' });
    }
    const otp = crypto.randomBytes(3).toString('hex').toUpperCase();
    adminUser.otp = otp;
    adminUser.otpExpires = Date.now() + 3600000; // 1 hour
    await adminUser.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}`
    };
    await transporter.sendMail(mailOptions);
    res.json({ msg: 'OTP sent to your email.' });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to send OTP.' });
  }
};

exports.adminResetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const adminUser = await Admin.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() }
    });
    if (!adminUser) {
      return res.status(400).json({ msg: 'Invalid or expired OTP.' });
    }
    adminUser.password = newPassword;
    adminUser.otp = undefined;
    adminUser.otpExpires = undefined;
    await adminUser.save();
    res.json({ msg: 'Password reset successfully!' });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
};
