const mongoose = require('mongoose');

const videoSubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  videoUrl: { type: String, },
  stageImage: { type: String }, // Added for stage6 image
  answers: { type: Object, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  viewed: { type: Boolean, default: false },
  paidOut: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('VideoSubmission', videoSubmissionSchema);