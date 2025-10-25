// backend/middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

// 🔧 Configure Cloudinary (from .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ⚙️ Local temporary storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// Initialize multer
const upload = multer({ storage });

// 🪄 Middleware wrapper — auto-upload to Cloudinary
const uploadWithCloudinary = (fieldName) => {
  return [
    upload.single(fieldName),
    async (req, res, next) => {
      if (!req.file) return next();

      try {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "ecommerce_products",
        });

        // Delete local file
        fs.unlinkSync(req.file.path);

        // Replace local path with Cloudinary URL
        req.file.path = result.secure_url;
        req.file.filename = result.public_id;
        req.file.cloudinaryUrl = result.secure_url;

        console.log("✅ Uploaded to Cloudinary:", result.secure_url);
        next();
      } catch (error) {
        console.error("❌ Cloudinary upload error:", error);
        res.status(500).json({ message: "Image upload failed", error });
      }
    },
  ];
};

module.exports = { upload, uploadWithCloudinary };
