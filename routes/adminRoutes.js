const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Campaign = require('../models/Campaign');
const VideoSubmission = require('../models/VideoSubmission');
const User = require('../models/User');

const checkAdminRole = (req, res, next) => {
    // This is a placeholder for a real admin role check.
    // In a real application, you would check if req.user has an 'admin' role.
    next();
};

// --- Campaign Management ---

// Admin can create a new campaign
router.post('/campaigns', [auth, checkAdminRole], async (req, res) => {
    const { title, description, reward, tags, startDate, endDate, overview, guidelines, stages } = req.body;
    try {
        const newCampaign = new Campaign({
            title,
            description,
            reward,
            tags,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            overview,
            guidelines,
            stages,
        });
        await newCampaign.save();
        res.status(201).json({ msg: 'Campaign created successfully!', campaign: newCampaign });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Failed to create campaign.', error: err.message });
    }
});

// Admin can modify a campaign
router.put('/campaigns/:id', [auth, checkAdminRole], async (req, res) => {
    const { id } = req.params;
    try {
        const updatedCampaign = await Campaign.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedCampaign) {
            return res.status(404).json({ msg: 'Campaign not found' });
        }
        res.json({ msg: 'Campaign updated successfully!', campaign: updatedCampaign });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Failed to update campaign.', error: err.message });
    }
});

// Admin can view all campaign details
router.get('/campaigns', [auth, checkAdminRole], async (req, res) => {
    try {
        const campaigns = await Campaign.find();
        res.json(campaigns);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Failed to fetch campaigns.', error: err.message });
    }
});

// --- Review Management ---

// Admin can view all submissions for a campaign, with sorting and filtering options
router.get('/campaigns/:campaignId/submissions', [auth, checkAdminRole], async (req, res) => {
    const { campaignId } = req.params;
    const { sortBy, sortOrder, userAge, userLocation } = req.query; // Query parameters for sorting and filtering

    try {
        const filter = { campaignId };
        if (userAge) {
            filter.userAge = userAge; // Placeholder for age filtering logic
        }
        if (userLocation) {
            filter.userLocation = userLocation; // Placeholder for location filtering logic
        }
        
        let sort = {};
        if (sortBy === 'age') {
            sort['userId.age'] = sortOrder === 'desc' ? -1 : 1;
        } else if (sortBy === 'location') {
            sort['userId.cityState'] = sortOrder === 'desc' ? -1 : 1;
        } else if (sortBy === 'review') {
            sort['answers.rating'] = sortOrder === 'desc' ? -1 : 1; // Assuming a 'rating' key in the answers object
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
});

// Admin can view a single submission
router.get('/submissions/:id', [auth, checkAdminRole], async (req, res) => {
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
});

// Admin can approve or reject a submission
router.post('/submissions/:id/approve', [auth, checkAdminRole], async (req, res) => {
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
});

// Admin can reject a submission
router.post('/submissions/:id/reject', [auth, checkAdminRole], async (req, res) => {
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
});


// --- Transfers & Payouts ---

// Admin can list all pending withdrawal requests
router.get('/transfers/pending', [auth, checkAdminRole], async (req, res) => {
    try {
        // Find all submissions with approved status that have not yet been paid out
        const pendingPayouts = await VideoSubmission.find({ status: 'approved', paidOut: false })
            .populate('userId', 'name upiId accountDetails');
        
        res.json(pendingPayouts);
    } catch (err) {
        res.status(500).json({ msg: 'Failed to fetch pending transfers.', error: err.message });
    }
});

// Admin can process a transfer
router.post('/transfers/:submissionId/process', [auth, checkAdminRole], async (req, res) => {
    const { submissionId } = req.params;
    try {
        // In a real app, this would trigger a payment API.
        // For now, we'll mark the submission as paidOut.
        const submission = await VideoSubmission.findByIdAndUpdate(submissionId, { paidOut: true }, { new: true });
        
        if (!submission) {
            return res.status(404).json({ msg: 'Submission not found.' });
        }
        res.json({ msg: 'Transfer processed successfully.' });
    } catch (err) {
        res.status(500).json({ msg: 'Failed to process transfer.', error: err.message });
    }
});

module.exports = router;