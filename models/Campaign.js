const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['text', 'dropdown',"rating", 'mcq',"paragraph", 'video', 'audio'], required: true },
  label: { type: String, required: true },
  placeholder: { type: String },
  options: [{ type: String }],
});

const stageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: [questionSchema],
  video: { type: String },
  stage6Image : { type: String },
});

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  reward: { type: Number },
  imageUrl: { type: String },
  bannerImageUrl: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  category: { type: String },
  overview: { type: String },
  guidelines: { type: String },
  stages: [stageSchema],
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
});

module.exports = mongoose.model('Campaign', campaignSchema);