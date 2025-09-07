const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  userUpload,
  gcsUpload,
} = require("../middleware/uploadMiddleware");
const User = require("../models/User");
const VideoSubmission = require("../models/VideoSubmission");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/profile-image1", upload.single("profileImage"), (req, res) => {
  console.log("Files received:", req.file);
  res.json({ profileImage: "uploaded_url_here" });
});
// Get profile
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json({ name: user.name, isProfileComplete: user.isProfileComplete, profileImage: user.profileImage });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// GET: Fetch user profile
router.get("/profile-setup", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name dob gender cityState motherTongue qualification isProfileComplete"
    );

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(user);
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

router.post(
  "/profile-image",
  protect,
  userUpload,   // multer.fields()
  gcsUpload,    // uploads to GCS
  async (req, res) => {
    console.log("Files received:", req.files);
    console.log("Single file:", req.file);

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Pick from either req.file or req.files
    const uploadedFile =
      req.file ||
      (req.files?.profileImage && req.files.profileImage[0]);

    if (!uploadedFile?.gcsUrl) {
      return res.status(400).json({ msg: "Upload failed: no file received" });
    }

    user.profileImage = uploadedFile.gcsUrl;
    console.log("New profile image URL:", user.profileImage);
    await user.save();

    res.json({
      msg: "Profile image uploaded successfully!",
      profileImage: user.profileImage,
    });
  }
);

module.exports = router;

