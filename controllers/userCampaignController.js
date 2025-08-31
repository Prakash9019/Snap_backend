const VideoSubmission = require('../models/VideoSubmission');

exports.submitCampaign = async (req, res) => {
    const { id: campaignId } = req.params;
    const userId = req.user.id;
    const { answers } = req.body;

    try {
        const submission = new VideoSubmission({
            userId,
            campaignId,
            answers: JSON.parse(answers),
            videoUrl: req.files.video ? req.files.video[0].path : null,
            // imageUrl: req.files.image ? req.files.image[0].path : null, // If you have an image upload
        });

        await submission.save();

        res.status(201).json({ msg: 'Campaign submitted successfully!' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Failed to submit campaign.', error: err.message });
    }
};