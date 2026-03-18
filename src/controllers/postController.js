const postService = require("../services/postService");
const categoryService = require("../services/categoryService");
const slugify = require("slugify");

exports.getAll = async (req, res) => {
  try {
    let posts;
    if (
      req.user.role === "admin" ||
      req.user.role === "manager" ||
      req.user.role === "editor" ||
      req.user.role === "user"
    ) {
      posts = await postService.getAll();
    } else {
      posts = await postService.getPostsByUser(req.user.id);
    }
    res.render("dashboards/admin_posts", { posts, user: req.user });
  } catch (error) {
    res.status(500).send("Lỗi: " + error.message);
  }
};

exports.getCreateForm = async (req, res) => {
  try {
    const categories = await categoryService.getAll();
    res.render("dashboards/createPost", { categories, user: req.user });
  } catch (error) {
    res.status(500).send("Lỗi Server: " + error.message);
  }
};
exports.create = async (req, res) => {
  try {
    const imagePath = req.file ? `/uploads/posts/${req.file.filename}` : "";

    console.log("--> req.file:", req.file);

    const postData = {
      title: req.body.title,
      content: req.body.content,
      slug:
        slugify(String(req.body.title), { lower: true, strict: true }) +
        "-" +
        Date.now(),
      image: imagePath, // ← lấy từ req.file, không phải req.body
      categoryId: req.body.category_id,
      userId: req.user.id,
      status: "pending",
    };

    console.log("POST DATA:", postData);
    await postService.create(postData);
    res.redirect("/admin/posts");
  } catch (error) {
    console.error("LOI TAO BAI:", error.message);
    const categories = await categoryService.getAll();
    res.render("dashboards/createPost", {
      categories,
      user: req.user,
      error: "Loi tao bai: " + error.message,
    });
  }
};
exports.approvePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    await postService.updateStatus(id, action);
    res.redirect("/admin/posts");
  } catch (error) {
    res.status(400).send("Lỗi khi duyệt bài: " + error.message);
  }
};

exports.delete = async (req, res) => {
  try {
    await postService.delete(req.params.id);
    res.redirect("/admin/posts");
  } catch (error) {
    res.status(400).send("Lỗi xóa bài: " + error.message);
  }
};
