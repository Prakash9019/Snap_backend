const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');
const { Storage } = require('@google-cloud/storage');
// Load environment variables
const cors = require('cors');
dotenv.config();

// Connect to MongoDB
connectDB();
const storage = new Storage();
const bucketName = "your-bucket-name";
const app = express();

// Middleware
app.use(express.json());
// ✅ Configure CORS
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-frontend-domain.com'],
  credentials: true
}));


// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/userRoutes')); 
app.use('/api/videos', require('./routes/videoRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/campaigns', require('./routes/campaignsRoutes'));

app.get("/api/get-upload-url", async (req, res) => {
  try {
    const fileName = `profile_${Date.now()}.jpg`;
    const options = {
      version: "v4",
      action: "write",
      expires: Date.now() + 5 * 60 * 1000, // 5 minutes
      contentType: "image/jpeg",
    };

    const [url] = await storage
      .bucket(rech_link)
      .file(fileName)
      .getSignedUrl(options);

    res.json({ uploadUrl: url, publicUrl: `https://storage.googleapis.com/${rech_link}/${fileName}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
const PORT =  5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));