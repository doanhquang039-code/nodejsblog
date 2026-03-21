const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith("video/");
    return {
      folder: "my_blog_assets",
      resource_type: isVideo ? "video" : "image",
      allowed_formats: ["jpg", "png", "mp4", "mov"],
      public_id: Date.now() + "-" + file.originalname.split(".")[0],
    };
  },
});
module.exports = { cloudinary, storage };
