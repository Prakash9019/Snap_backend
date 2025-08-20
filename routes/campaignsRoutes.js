const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Campaign = require('../models/Campaign');

router.get('/', auth, async (req, res) => {
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

router.get('/:id', auth, async (req, res) => {
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

module.exports = router;