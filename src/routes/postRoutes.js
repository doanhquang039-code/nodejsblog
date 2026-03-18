const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const postController = require("../controllers/postController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
router.get("/", authMiddleware, postController.getAll); // Cho phép xem danh sách bài của chính mình hoặc tất cả
router.get("/create", authMiddleware, postController.getCreateForm);
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "manager", "editor", "user"]),
  postController.getAll,
);
console.log(
  "Kiểm tra biến upload:",
  typeof upload.single === "function" ? "OK" : "LỖI",
);
router.post(
  "/create",
  authMiddleware,
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.error("❌ MULTER ERROR:", err.code, err.message);
        return res.status(400).send("Multer lỗi: " + err.code);
      } else if (err && err.message !== "Unexpected end of form") {
        // Bỏ qua lỗi "Unexpected end of form" vì file đã upload OK
        console.error("❌ OTHER ERROR:", err.message);
        return res.status(400).send("Lỗi khác: " + err.message);
      }
      console.log("✅ MULTER OK - req.file:", req.file);
      next();
    });
  },
  postController.create,
);
router.post(
  "/delete/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  postController.delete,
);

module.exports = router;
