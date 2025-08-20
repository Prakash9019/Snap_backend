const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Campaign = require('../models/Campaign');
const VideoSubmission = require('../models/VideoSubmission');
const User = require('../models/User');

const checkAdminRole = (req, res, next) => {
  next();
};

router.post('/campaigns', [auth, checkAdminRole], async (req, res) => {
  const { title, description, reward, stages, startDate, endDate } = req.body;
  try {
    const newCampaign = new Campaign({
      title,
      description,
      reward,
      stages,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });
    await newCampaign.save();
    res.status(201).json(newCampaign);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/approve-submission/:submissionId', [auth, checkAdminRole], async (req, res) => {
  const { submissionId } = req.params;
  try {
    const submission = await VideoSubmission.findByIdAndUpdate(submissionId, { status: 'approved' }, { new: true });
    if (!submission) {
      return res.status(404).json({ msg: 'Submission not found' });
    }

    const campaign = await Campaign.findById(submission.campaignId);
    if (campaign) {
      const user = await User.findById(submission.userId);
      user.wallet.totalEarnings += campaign.reward;
      await user.save();
    }
    
    res.json({ msg: 'Submission approved and payment processed!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;