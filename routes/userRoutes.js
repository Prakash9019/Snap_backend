const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const VideoSubmission = require('../models/VideoSubmission');

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name isProfileComplete');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json({ name: user.name, isProfileComplete: user.isProfileComplete });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/profile-setup', auth, async (req, res) => {
    const { name, dateOfBirth, gender, cityState, motherTongue, qualification } = req.body;
    
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        
        user.name = name;
        user.dateOfBirth = dateOfBirth;
        user.gender = gender;
        user.cityState = cityState;
        user.motherTongue = motherTongue;
        user.qualification = qualification;
        user.isProfileComplete = true; 
        
        await user.save();
        
        res.json({ msg: 'Profile updated successfully!', isProfileComplete: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/submissions', auth, async (req, res) => {
  try {
    const submissions = await VideoSubmission.find({ userId: req.user.id })
      .populate('campaignId', 'title imageUrl')
      .sort({ createdAt: -1 });

    const formattedSubmissions = submissions.map(sub => ({
      id: sub.id,
      campaignTitle: sub.campaignId.title,
      status: sub.status === 'pending' ? 'In Progress' : 'Completed',
      imageUrl: sub.campaignId.imageUrl,
    }));
    
    res.json(formattedSubmissions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/upi-id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('upiId');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json({ upiId: user.upiId });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/save-upi', auth, async (req, res) => {
    const { upiId } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        user.upiId = upiId;
        await user.save();
        res.json({ msg: 'UPI ID saved successfully!' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/account-details', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('accountDetails');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json({ accountDetails: user.accountDetails });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/save-account', auth, async (req, res) => {
    const { accountDetails } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        user.accountDetails = accountDetails;
        await user.save();
        res.json({ msg: 'Account details saved successfully!' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/wallet', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('wallet');
    res.json(user.wallet);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.post('/wallet/withdraw', auth, async (req, res) => {
  const { amount, method, upiId, accountDetails } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.wallet.totalEarnings < amount) {
      return res.status(400).json({ msg: 'Insufficient balance' });
    }

    res.json({ msg: 'Withdrawal request submitted successfully.' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});


module.exports = router;