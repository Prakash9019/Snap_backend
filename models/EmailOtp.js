// models/EmailOtp.js
const mongoose = require("mongoose");

const EmailOtpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, 
  // "expires: 300" → auto-delete after 5 mins
});

module.exports = mongoose.model("EmailOtp", EmailOtpSchema);
