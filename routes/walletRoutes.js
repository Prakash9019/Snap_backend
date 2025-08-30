const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getWalletDetails, requestWithdrawal } = require('../controllers/walletController');

router.route('/').get(protect, getWalletDetails);
router.route('/withdraw').post(protect, requestWithdrawal);

module.exports = router;