const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['text', 'dropdown', 'mcq', 'video', 'audio'], required: true },
  label: { type: String, required: true },
  placeholder: { type: String },
  options: [{ type: String }],
});

const stageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: [questionSchema],
});

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  reward: { type: Number, required: true },
  imageUrl: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  category: { type: String },
  overview: { type: String },
  guidelines: { type: String },
  stages: [stageSchema],
});

module.exports = mongoose.model('Campaign', campaignSchema);