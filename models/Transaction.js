const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['payout', 'video_incentive', 'referral_bonus'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'processed', 'failed'], default: 'pending' },
  transactionDate: { type: Date, default: Date.now },
  paymentMethod: { type: String, enum: ['upi', 'bank'] },
  upiId: { type: String },
  accountDetails: {
    accountNumber: { type: String },
    ifscCode: { type: String },
    accountName: { type: String }
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);