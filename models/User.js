const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  mobileNumber: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  name: { type: String },
  dob: { type: Date },
  gender: { type: String },
  cityState: { type: String },
  motherTongue: { type: String },
  qualification: { type: String },
  isProfileComplete: { type: Boolean, default: false },
  upiId: { type: String },
  accountDetails: {
    accountNumber: { type: String },
    ifscCode: { type: String },
    accountName: { type: String }
  },
  wallet: {
    approvedBalance: { type: Number, default: 0 },
    pendingBalance: { type: Number, default: 0 },
    payoutHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }]
  },
});

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);