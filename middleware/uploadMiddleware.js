const multer = require('multer');
const { bucket } = require('../config/gcp');
const path = require('path');

// Multer configuration for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 5MB file size limit
});
const gcsUpload = (req, res, next) => {
  let files = [];

  // Support for fields()
  if (req.files && !Array.isArray(req.files)) {
    Object.keys(req.files).forEach(key => {
      files = files.concat(req.files[key]);
    });
  }

  // Support for single()/array()
  if (req.file) {
    files.push(req.file);
  }
  if (Array.isArray(req.files)) {
    files = files.concat(req.files);
  }

  if (!files.length) return next();

  const uploadPromises = files.map(file => {
    const newFilename = `${Date.now()}-${file.originalname}`;
    const blob = bucket.file(newFilename);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      blobStream.on("error", reject);
      blobStream.on("finish", async () => {
        try {
          // await blob.makePublic();
          file.gcsUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
          resolve();
        } catch (err) {
          reject(err);
        }
      });
      blobStream.end(file.buffer);
    });
  });

  Promise.all(uploadPromises)
    .then(() => next())
    .catch(err => {
      console.error("GCS Upload Error:", err);
      res.status(500).json({ message: "File upload failed", error: err.message });
    });
};

// Admin upload fields
const adminUpload = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'bannerImage', maxCount: 1 },
]);

// User upload fields
const userUpload = upload.fields([
  { name: 'videoUri', maxCount: 1 },
  { name: 'image', maxCount: 1 },
  { name: 'stageImageUri', maxCount: 1 }, // Added for stage6 image
  { name: 'profileImage', maxCount: 1 }
]);

module.exports = { adminUpload, userUpload, gcsUpload };
