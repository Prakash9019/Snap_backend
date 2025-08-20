// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//   // OTP Login
//   mobileNumber: { type: String, unique: true, sparse: true }, // 'sparse' allows multiple null values
//   // Email/Password Login
//   email: { type: String, unique: true, sparse: true },
//   password: { type: String },
//   // Google Login
//   googleId: { type: String, unique: true, sparse: true },
//   // User Profile
//   name: { type: String },
//   age: { type: Number },
//   gender: { type: String },
//   city: { type: String },
//   preferredLanguage: { type: String },
//   isTermsAccepted: { type: Boolean, default: false },
//   upiId: { type: String },
//   wallet: {
//     totalEarnings: { type: Number, default: 0 },
//     approvedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
//     pendingVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
//     payoutHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }]
//   },
//   referralCode: { type: String, unique: true, sparse: true },
//   referredBy: { type: String }
// });

// // Hash password before saving
// userSchema.pre('save', async function(next) {
//   if (this.isModified('password')) {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//   }
//   next();
// });

// // Method to compare passwords
// userSchema.methods.matchPassword = async function(enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// module.exports = mongoose.model('User', userSchema);


const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  mobileNumber: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  name: { type: String },
  age: { type: Number },
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
    totalEarnings: { type: Number, default: 0 },
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