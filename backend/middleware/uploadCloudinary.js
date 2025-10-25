// backend/middleware/uploadCloudinary.js
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Create a storage engine using Cloudinary
const uploadWithCloudinary = (fieldName) => {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "ecommerce_uploads",
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
      public_id: (req, file) => Date.now() + "-" + file.originalname,
    },
  });

  const upload = multer({ storage });
  return upload.single(fieldName);
};

module.exports = { uploadWithCloudinary };
