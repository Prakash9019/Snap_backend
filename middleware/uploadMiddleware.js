const multer = require('multer');
const { bucket } = require('../config/gcp');
const path = require('path');

// Multer configuration for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});

// Middleware to upload files to GCS
const gcsUpload = (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next();
  }

  const uploadPromises = [];

  for (const key in req.files) {
    if (req.files.hasOwnProperty(key)) {
      const files = req.files[key];
      files.forEach(file => {
        const newFilename = `${Date.now()}-${file.originalname}`;
        const blob = bucket.file(newFilename);
        const blobStream = blob.createWriteStream({
          resumable: false,
          metadata: {
            contentType: file.mimetype,
          },
        });

        const promise = new Promise((resolve, reject) => {
          blobStream.on('error', err => { reject(err); });
          blobStream.on('finish', async () => {
            try {
              await blob.makePublic();
              file.gcsUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
              resolve();
            } catch (err) {
              reject(err);
            }
          });
          blobStream.end(file.buffer);
        });
        uploadPromises.push(promise);
      });
    }
  }

  Promise.all(uploadPromises)
    .then(() => next())
    .catch(err => {
      console.error('GCS Upload Error:', err);
      res.status(500).json({ message: 'File upload failed', error: err.message });
    });
};

// Admin upload fields
const adminUpload = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'bannerImage', maxCount: 1 },
]);

// User upload fields
const userUpload = upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'image', maxCount: 1 },
]);

module.exports = { adminUpload, userUpload, gcsUpload };
