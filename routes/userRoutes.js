const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  userUpload,
  gcsUpload,
} = require("../middleware/uploadMiddleware");
const User = require("../models/User");
const VideoSubmission = require("../models/VideoSubmission");

// Get profile
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name isProfileComplete"
    );
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json({ name: user.name, isProfileComplete: user.isProfileComplete });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Profile setup
router.post("/profile-setup", protect, async (req, res) => {
  const { name, dateOfBirth, gender, cityState, motherTongue, qualification } =
    req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.name = name;
    user.dob = dateOfBirth;
    user.gender = gender;
    user.cityState = cityState;
    user.motherTongue = motherTongue;
    user.qualification = qualification;
    user.isProfileComplete = true;

    await user.save();

    res.json({ msg: "Profile updated successfully!", isProfileComplete: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Video submissions
router.get("/submissions", protect, async (req, res) => {
  try {
    const submissions = await VideoSubmission.find({ userId: req.user.id })
      .populate("campaignId", "title imageUrl")
      .populate("campaignId", "title imageUrl")
      .sort({ createdAt: -1 });

    const formattedSubmissions = submissions.map((sub) => ({
      id: sub.id,
      campaignTitle: sub.campaignId.title,
      status: sub.status === "pending" ? "In Progress" : "Completed",
      imageUrl: sub.campaignId.imageUrl,
    }));


    res.json(formattedSubmissions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Get UPI
router.get("/upi-id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("upiId");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json({ upiId: user.upiId });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
})
// Get UPI
router.get("/upi-id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("upiId");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json({ upiId: user.upiId });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Save UPI
router.post("/save-upi", protect, async (req, res) => {
  const { upiId } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    user.upiId = upiId;
    await user.save();
    res.json({ msg: "UPI ID saved successfully!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
})
// Save UPI
router.post("/save-upi", protect, async (req, res) => {
  const { upiId } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    user.upiId = upiId;
    await user.save();
    res.json({ msg: "UPI ID saved successfully!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Get account details
router.get("/account-details", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("accountDetails");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json({ accountDetails: user.accountDetails });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// Get account details
router.get("/account-details", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("accountDetails");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json({ accountDetails: user.accountDetails });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Save account details
router.post("/save-account", protect, async (req, res) => {
  const { accountDetails } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    user.accountDetails = accountDetails;
    await user.save();
    res.json({ msg: "Account details saved successfully!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Profile image upload
router.post(
  "/profile-image",
  protect,
  userUpload,
  gcsUpload,
  async (req, res) => {
    try {
      console.log("Files received:", req.files);
console.log("Body:", req.body);

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      if (req.files.profileImage) {
        user.profileImage = req.files.profileImage[0].gcsUrl;
      }

      await user.save();
      res.json({
        msg: "Profile image uploaded successfully!",
        profileImage: user.profileImage,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;

