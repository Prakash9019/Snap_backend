const { Storage } = require('@google-cloud/storage');
const path = require('path');

// Ensure GOOGLE_APPLICATION_CREDENTIALS is set in your .env or environment
// It should point to the path of your service account key file.
// Example: GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/keyfile.json

// Alternatively, you can directly provide the key file content:
// const storage = new Storage({
//   credentials: JSON.parse(process.env.GCP_KEY_FILE_CONTENT)
// });

const storage = new Storage();

const bucketName = process.env.GCP_BUCKET_NAME;

if (!bucketName) {
  console.error('GCP_BUCKET_NAME environment variable is not set.');
  process.exit(1);
}

const bucket = storage.bucket(bucketName);

module.exports = { bucket };
