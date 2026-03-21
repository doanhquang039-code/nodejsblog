const postService = require("../services/postService");
const categoryService = require("../services/categoryService");
const { Tag } = require("../models");
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
    const { title, content, category_id, tags } = req.body;
    let imagePath = "";
    let videoPath = "";
    if (req.file) {
      const cloudUrl = req.file.path;
      if (cloudUrl.includes("/video/upload/")) {
        videoPath = cloudUrl;
        imagePath = "";
      } else {
        imagePath = cloudUrl;
        videoPath = "";
      }
    }
    const postData = {
      title,
      content,
      image: imagePath,
      video: videoPath,
      slug: slugify(title, { lower: true }) + "-" + Date.now(),
      categoryId: category_id,
      userId: req.user.id,
      status: "pending",
    };
    const post = await postService.create(postData);
    if (tags && tags.trim() !== "") {
      const tagNames = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t !== "");
      const tagInstances = [];
      for (const name of tagNames) {
        const [tag] = await Tag.findOrCreate({ where: { name: name } });
        tagInstances.push(tag);
      }
      await post.setTags(tagInstances);
      console.log(
        `✅ Đã lưu ${tagInstances.length} tags cho bài ID: ${post.id}`,
      );
    }
    res.redirect("/admin/posts");
  } catch (error) {
    console.error("❌ LỖI LƯU TAG:", error.message);
    const categories = await categoryService.getAll();
    res.render("dashboards/createPost", {
      categories,
      user: req.user,
      error: "Lỗi: " + error.message,
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
