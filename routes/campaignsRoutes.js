const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { userUpload, gcsUpload } = require('../middleware/uploadMiddleware');
const Campaign = require('../models/Campaign');
const { submitCampaign } = require('../controllers/userCampaignController');

router.get('/', protect, async (req, res) => {
  try {
    const now = new Date();
    const campaigns = await Campaign.find({
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).select('id title description reward imageUrl');
    
    res.json(campaigns);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/:id', protect, async (req, res) => {
  const { id } = req.params;
  try {
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ msg: 'Campaign not found' });
    }

    const now = new Date();
    if (campaign.startDate > now || campaign.endDate < now) {
      return res.status(400).json({ msg: 'Campaign is not currently active' });
    }
    res.json(campaign);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// // Upload stage6 media (video and stage image)
// router.post('/upload-stage6-media', protect, userUpload, gcsUpload, async (req, res) => {
//   try {
//     const uploadedFiles = {};
//     if (req.files.videoUri) {
//       uploadedFiles.videoUri = req.files.videoUri[0].gcsUrl;
//     }
    
//     if (req.files.stageImageUri) {
//       uploadedFiles.stageImageUri = req.files.stageImageUri[0].gcsUrl;
//     }
//         console.log("Files after GCS upload:", req.files);
//     console.log(req.files.videoUri[0].gcsUrl);
//     console.log(req.files.stageImageUri[0].gcsUrl);
//     res.json({ 
//       msg: 'Media uploaded successfully', 
//       ...uploadedFiles 
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ msg: 'Failed to upload media', error: err.message });
//   }
// });

router.post(
  "/upload-stage6-media",
  protect,
  userUpload,
  gcsUpload,
  async (req, res) => {
    try {
      const uploadedFiles = {};

      // ✅ log after gcsUpload
      console.log("Files after GCS upload:", req.files);

      if (req.files.videoUri) {
        uploadedFiles.videoUri = req.files.videoUri[0].gcsUrl;
      }

      if (req.files.stageImageUri) {
        uploadedFiles.stageImageUri = req.files.stageImageUri[0].gcsUrl;
      }
      console.log("hiiiiiiiiiiii" + req.files.videoUri[0].gcsUrl);
      res.json({
        msg: "Media uploaded successfully",
          videoUrl: uploadedFiles.videoUri || null,
          stageImage: uploadedFiles.stageImageUri || null
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        msg: "Failed to upload media",
        error: err.message,
      });
    }
  }
);


router.post('/:id/submit', protect, userUpload, gcsUpload, submitCampaign);

module.exports = router;