const commentService = require("../services/commentService");
exports.addComment = async (req, res) => {
  try {
    const { postId, content } = req.body;
    await commentService.create({
      postId: postId,
      userId: req.user.id,
      content: content,
    });
    res.redirect(`/admin/posts/view/${postId}`);
  } catch (error) {
    console.error("Lỗi cmt:", error.message);
    res.status(500).send("Lỗi: " + error.message);
  }
};
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    await commentService.delete(id);
    const backURL = req.get("Referer") || "/admin/posts";
    res.redirect(backURL);
  } catch (error) {
    console.error("Lỗi xóa cmt:", error.message);
    res.status(500).send("Lỗi: " + error.message);
  }
};
exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    console.log("📥 ID:", id, "| content:", content);
    console.log("📥 Toàn bộ req.body:", req.body);
    await commentService.update(id, content);
    res.redirect(req.get("Referer") || "/admin/posts");
  } catch (error) {
    console.error("Lỗi update cmt:", error.message);
    res.status(500).send("Lỗi: " + error.message);
  }
};
