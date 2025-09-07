const VideoSubmission = require('../models/VideoSubmission');

exports.submitCampaign = async (req, res) => {
  const userId = req.user.id;
  const { campaignId, stageAnswers } = req.body;
  try {
    const submission = new VideoSubmission({
      userId,
      campaignId,
      answers: stageAnswers ? JSON.parse(stageAnswers) : [], // frontend sends stageAnswers
      videoUrl: req.files?.videoUri ? req.files.videoUri[0].gcsUrl : null, // match "videoUri"
      stageImage: req.files?.stageImageUri ? req.files.stageImageUri[0].gcsUrl : null, // match "stageImageUri"
    });
       console.log(req.files)
   console.log(req.files.videoUri[0].gcsUrl)
   console.log(req.files.stageImageUri[0].gcsUrl);
   console.log("hiiiiiiiiiiii" + req.files.videoUri[0].gcsUrl);
   console.log(submission)
    await submission.save();

    res.status(201).json({ msg: 'Campaign submitted successfully!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Failed to submit campaign.', error: err.message });
  }
};
