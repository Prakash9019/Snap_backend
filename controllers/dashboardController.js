const Campaign = require('../models/Campaign');
const VideoSubmission = require('../models/VideoSubmission');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

exports.getDashboardStats = async (req, res) => {
    try {
        const adminId = req.user.id;

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date();
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        endOfMonth.setDate(0);
        endOfMonth.setHours(23, 59, 59, 999);

        const reviewsLaunched = await VideoSubmission.countDocuments({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        });

        const transfersProcessed = await Transaction.countDocuments({
            status: 'completed',
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        });

        const campaignsCreated = await Campaign.countDocuments({
            admin: adminId,
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        });

        // This is a placeholder for user interactions. You might need a more specific model for this.
        const userInteractions = await VideoSubmission.countDocuments({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        });

        res.json({
            reviewsLaunched,
            transfersProcessed,
            campaignsCreated,
            userInteractions,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Failed to fetch dashboard stats.', error: err.message });
    }
};