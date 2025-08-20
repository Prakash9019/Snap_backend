const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;
const JWT_SECRET = process.env.JWT_SECRET;

const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '1h' });
};

router.post('/send-otp', async (req, res) => {
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
});

router.post('/verify-otp', async (req, res) => {
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
});

router.post('/register-email', async (req, res) => {
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
});

router.post('/login-email', async (req, res) => {
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
});

router.post('/login-google', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
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
    res.json({ token: authToken });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;