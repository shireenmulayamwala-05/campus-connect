const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "CampusConnect",
    allowed_formats: ["jpg", "png", "jpeg", "pdf"],
    resource_type: "auto", // Automatically detects PDF as image or raw
    access_mode: "public", // Ensure public access
  },
});
const upload = multer({ storage });
module.exports = { upload, cloudinary, storage };
