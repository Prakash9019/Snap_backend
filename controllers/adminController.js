const VideoSubmission = require('../models/VideoSubmission');
const User = require('../models/User');
const Campaign = require('../models/Campaign');

// @desc    Get all submissions for a campaign
// @route   GET /api/admin/campaigns/:campaignId/submissions
// @access  Private/Admin
exports.getSubmissionsForCampaign = async (req, res) => {
    const { campaignId } = req.params;
    const { sortBy, sortOrder, userAge, userLocation } = req.query;

    try {
        const filter = { campaignId };
        if (userAge) {
            // This is a placeholder for age filtering logic.
            // You would need to calculate age based on date of birth stored in the User model.
        }
        if (userLocation) {
            // This assumes userLocation is a string that can be matched against the user's location.
        }

        let sort = {};
        if (sortBy === 'age') {
            sort['userId.age'] = sortOrder === 'desc' ? -1 : 1;
        } else if (sortBy === 'location') {
            sort['userId.cityState'] = sortOrder === 'desc' ? -1 : 1;
        } else {
            sort['createdAt'] = -1; // Default sort by date
        }

        const submissions = await VideoSubmission.find(filter)
            .populate('userId', 'name age cityState')
            .sort(sort);

        res.json(submissions);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Failed to fetch submissions.', error: err.message });
    }
};

// @desc    Get a single submission
// @route   GET /api/admin/submissions/:id
// @access  Private/Admin
exports.getSubmissionById = async (req, res) => {
    const { id } = req.params;
    try {
        const submission = await VideoSubmission.findById(id).populate('userId', 'name age cityState');
        if (!submission) {
            return res.status(404).json({ msg: 'Submission not found' });
        }
        res.json(submission);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Failed to fetch submission.', error: err.message });
    }
};

// @desc    Approve a submission
// @route   POST /api/admin/submissions/:id/approve
// @access  Private/Admin
exports.approveSubmission = async (req, res) => {
    const { id } = req.params;
    try {
        const submission = await VideoSubmission.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
        if (!submission) {
            return res.status(404).json({ msg: 'Submission not found' });
        }

        const campaign = await Campaign.findById(submission.campaignId);
        if (campaign) {
            const user = await User.findById(submission.userId);
            user.wallet.totalEarnings += campaign.reward;
            await user.save();
        }
        res.json({ msg: 'Submission approved and payment processed!', submission });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Failed to approve submission.', error: err.message });
    }
};

// @desc    Reject a submission
// @route   POST /api/admin/submissions/:id/reject
// @access  Private/Admin
exports.rejectSubmission = async (req, res) => {
    const { id } = req.params;
    try {
        const submission = await VideoSubmission.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
        if (!submission) {
            return res.status(404).json({ msg: 'Submission not found' });
        }
        res.json({ msg: 'Submission rejected.', submission });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Failed to reject submission.', error: err.message });
    }
};

// @desc    Mark a submission as viewed
// @route   POST /api/admin/submissions/:id/view
// @access  Private/Admin
exports.markSubmissionAsViewed = async (req, res) => {
    const { id } = req.params;
    try {
        const submission = await VideoSubmission.findByIdAndUpdate(id, { viewed: true }, { new: true });
        if (!submission) {
            return res.status(404).json({ msg: 'Submission not found' });
        }
        res.json({ msg: 'Submission marked as viewed.', submission });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Failed to mark submission as viewed.', error: err.message });
    }
};

// @desc    Get all pending transfers
// @route   GET /api/admin/transfers/pending
// @access  Private/Admin
exports.getPendingTransfers = async (req, res) => {
    try {
        const pendingPayouts = await VideoSubmission.find({ status: 'approved', paidOut: false })
            .populate('userId', 'name upiId accountDetails');
        res.json(pendingPayouts);
    } catch (err) {
        res.status(500).json({ msg: 'Failed to fetch pending transfers.', error: err.message });
    }
};

// @desc    Process a transfer
// @route   POST /api/admin/transfers/:submissionId/process
// @access  Private/Admin
exports.processTransfer = async (req, res) => {
    const { submissionId } = req.params;
    try {
        const submission = await VideoSubmission.findByIdAndUpdate(submissionId, { paidOut: true }, { new: true });
        if (!submission) {
            return res.status(404).json({ msg: 'Submission not found.' });
        }
        res.json({ msg: 'Transfer processed successfully.' });
    } catch (err) {
        res.status(500).json({ msg: 'Failed to process transfer.', error: err.message });
    }
};