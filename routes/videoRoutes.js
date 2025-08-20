const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/authMiddleware');
const Video = require('../models/Video');
const User = require('../models/User');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'video') {
      cb(null, 'uploads/videos/');
    } else if (file.fieldname === 'bill') {
      cb(null, 'uploads/bills/');
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

router.post('/upload', auth, upload.fields([{ name: 'video', maxCount: 1 }, { name: 'bill', maxCount: 1 }]), async (req, res) => {
  const { campaignName } = req.body;
  const userId = req.user.id;
  
  if (!req.files || !req.files['video']) {
    return res.status(400).json({ msg: 'Video file is required' });
  }
  
  try {
    const videoUrl = `/uploads/videos/${req.files['video'][0].filename}`;
    const billScreenshotUrl = req.files['bill'] ? `/uploads/bills/${req.files['bill'][0].filename}` : null;
    
    const newVideo = new Video({ userId, campaignName, videoUrl, billScreenshotUrl });
    await newVideo.save();
    
    await User.findByIdAndUpdate(userId, { $push: { 'wallet.pendingVideos': newVideo._id } });

    res.status(201).json({ msg: 'Video submitted for review.' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/submit-flow', auth, upload.single('video'), async (req, res) => {
  const { campaignId, answers } = req.body;
  const userId = req.user.id;
  const videoUrl = req.file ? `/uploads/videos/${req.file.filename}` : null;

  try {
    const newSubmission = new VideoSubmission({
      userId,
      campaignId,
      videoUrl,
      answers: JSON.parse(answers),
      status: 'pending',
    });
    await newSubmission.save();

    res.status(201).json({ msg: 'Video and data submitted successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;