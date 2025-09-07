const VideoSubmission = require('../models/VideoSubmission');

exports.submitCampaign = async (req, res) => {
  const userId = req.user.id;
  const { campaignId, stageAnswers } = req.body;

  try {
    const submission = new VideoSubmission({
      userId,
      campaignId,
      // ✅ if frontend is already sending JSON.stringify(stageAnswers)
      answers: stageAnswers ? JSON.parse(stageAnswers) : [],

      // ✅ safer way to access uploaded files
      videoUrl: req.files?.videoUri?.[0]?.gcsUrl || null,
      stageImage: req.files?.stageImageUri?.[0]?.gcsUrl || null,
    });

    await submission.save();

    res.status(201).json({ msg: 'Campaign submitted successfully!' });
  } catch (err) {
    console.error("Submit error:", err);
    res.status(500).json({ msg: 'Failed to submit campaign.', error: err.message });
  }
};
