const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('wallet upiId');
    res.json(user);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.post('/payout', auth, async (req, res) => {
  const { upiId, amount } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.wallet.totalEarnings < amount) {
      return res.status(400).json({ msg: 'Insufficient balance' });
    }

    // This is the manual payout step:
    // The request is submitted, but the actual money transfer is handled by an admin.
    res.json({ msg: 'Payout request submitted successfully. Awaiting admin approval.' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;