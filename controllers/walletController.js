const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.getWalletDetails = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('wallet upiId accountDetails').populate('wallet.payoutHistory');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.requestWithdrawal = async (req, res) => {
    const { amount, method, upiId, accountDetails } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (user.wallet.approvedBalance < amount) {
            return res.status(400).json({ msg: 'Insufficient approved balance' });
        }

        const transaction = new Transaction({
            userId,
            amount,
            type: 'payout',
            status: 'pending',
            paymentMethod: method,
            upiId: method === 'upi' ? upiId : null,
            accountDetails: method === 'bank' ? accountDetails : null,
        });

        await transaction.save();

        user.wallet.approvedBalance -= amount;
        user.wallet.pendingBalance += amount;
        user.wallet.payoutHistory.push(transaction._id);

        await user.save();

        res.json({ msg: 'Withdrawal request submitted successfully.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};