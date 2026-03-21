const multer = require("multer");
const { storage } = require("../config/cloudinary");
const fileFilter = (req, file, cb) => {
  // 1. Kiểm tra đuôi file (Extension)
  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".mp4",
    ".mov",
    ".mkv",
    ".avi",
  ];
  const fileExt = require("path").extname(file.originalname).toLowerCase();
  const isPhoto = file.mimetype.startsWith("image/");
  const isVideo = file.mimetype.startsWith("video/");

  if (allowedExtensions.includes(fileExt) || isPhoto || isVideo) {
    return cb(null, true);
  }
  console.log("File bị từ chối:", file.originalname, "Mime:", file.mimetype);
  cb(new Error("Chỉ chấp nhận file ảnh hoặc video hợp lệ!"));
};
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: fileFilter,
});

module.exports = upload;
