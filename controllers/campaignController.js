const Campaign = require('../models/Campaign');

// @desc    Create a campaign
// @route   POST /api/admin/campaigns
// @access  Private/Admin
exports.createCampaign = async (req, res) => {
    const { title,   tags, startDate, endDate, overview, guidelines, stages } = req.body;
    console.log(req.body)
    const adminId = req.user.id;

    try {
        const newCampaign = new Campaign({
            title,
            tags,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            overview,
            guidelines,
            stages,
            admin: adminId,
            imageUrl: req?.files?.profileImage ? req.files.profileImage[0].gcsUrl : null,
            bannerImageUrl: req.files?.bannerImage ? req.files.bannerImage[0].gcsUrl : null,
        });

        await newCampaign.save();
        res.status(201).json({ msg: 'Campaign created successfully!', campaign: newCampaign });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Failed to create campaign.', error: err.message });
    }
};

// @desc    Update a campaign
// @route   PUT /api/admin/campaigns/:id
// @access  Private/Admin
exports.updateCampaign = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    if (req.files) {
        if (req.files.profileImage) {
            updateData.imageUrl = req.files.profileImage[0].gcsUrl;
        }
        if (req.files.bannerImage) {
            updateData.bannerImageUrl = req.files.bannerImage[0].gcsUrl;
        }
    }

    try {
        const updatedCampaign = await Campaign.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedCampaign) {
            return res.status(404).json({ msg: 'Campaign not found' });
        }
        res.json({ msg: 'Campaign updated successfully!', campaign: updatedCampaign });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Failed to update campaign.', error: err.message });
    }
};

// @desc    Get all campaigns
// @route   GET /api/admin/campaigns
// @access  Private/Admin
exports.getAllCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find().populate('admin', 'name email');
        res.json(campaigns);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Failed to fetch campaigns.', error: err.message });
    }
};

// @desc    Get campaigns for the logged in admin
// @route   GET /api/admin/campaigns/my-campaigns
// @access  Private/Admin
exports.getMyCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find({ admin: req.user.id }).populate('admin', 'name email');
        res.json(campaigns);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Failed to fetch campaigns.', error: err.message });
    }
};

// @desc    Update a campaign
// @route   PUT /api/admin/campaigns/:id
// @access  Private/Admin
exports.updateCampaign = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    if (req.files) {
        if (req.files.imageUrl) {
            updateData.imageUrl = req.files.imageUrl[0].path;
        }
        if (req.files.bannerImageUrl) {
            updateData.bannerImageUrl = req.files.bannerImageUrl[0].path;
        }
    }

    try {
        const updatedCampaign = await Campaign.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedCampaign) {
            return res.status(404).json({ msg: 'Campaign not found' });
        }
        res.json({ msg: 'Campaign updated successfully!', campaign: updatedCampaign });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Failed to update campaign.', error: err.message });
    }
};

// @desc    Get all campaigns
// @route   GET /api/admin/campaigns
// @access  Private/Admin
exports.getAllCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find().populate('admin', 'name email');
        res.json(campaigns);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Failed to fetch campaigns.', error: err.message });
    }
};

// @desc    Get campaigns for the logged in admin
// @route   GET /api/admin/campaigns/my-campaigns
// @access  Private/Admin
exports.getMyCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find({ admin: req.user.id }).populate('admin', 'name email');
        res.json(campaigns);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Failed to fetch campaigns.', error: err.message });
    }
};