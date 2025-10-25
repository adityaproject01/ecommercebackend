// backend/middleware/uploadCloudinary.js
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure your Cloudinary credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer storage for Cloudinary
const storage = multer.memoryStorage(); // store in memory first

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only jpg, jpeg, and png files are allowed"));
    }
  },
});

// Middleware to upload to Cloudinary
const uploadToCloudinary = (fieldName) => {
  return [
    upload.single(fieldName),
    async (req, res, next) => {
      if (!req.file) return next();

      try {
        const result = await cloudinary.uploader.upload_stream(
          { folder: "ecommerce" },
          (error, result) => {
            if (error) return next(error);
            req.file.path = result.secure_url; // save URL
            next();
          }
        );

        // Pipe buffer to Cloudinary
        result.end(req.file.buffer);
      } catch (err) {
        next(err);
      }
    },
  ];
};

module.exports = uploadToCloudinary;
