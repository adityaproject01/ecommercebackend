const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");

// 🔧 Configure Cloudinary credentials (from your .env file)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🧠 Multer memory storage (file stays in memory for upload)
const storage = multer.memoryStorage();

// ⚙️ Multer upload setup with filters and limits
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, JPEG, and PNG files are allowed"));
    }
  },
});

/**
 * 🚀 Upload file to Cloudinary middleware
 * @param {string} fieldName - The form field name for the image (e.g., "image")
 */
const uploadToCloudinary = (fieldName) => {
  return [
    upload.single(fieldName),

    async (req, res, next) => {
      // Skip if no file provided
      if (!req.file) return next();

      try {
        // Wrap upload_stream in a Promise to handle async correctly
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "ecommerce", // Folder name in your Cloudinary account
              resource_type: "image",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          // Send the file buffer to Cloudinary
          stream.end(req.file.buffer);
        });

        // ✅ Set the uploaded Cloudinary URL for backend route usage
        req.file.path = result.secure_url;

        // Continue to next middleware or route handler
        next();
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        res.status(500).json({
          message: "Image upload failed",
          error: err.message,
        });
      }
    },
  ];
};

module.exports = uploadToCloudinary;
