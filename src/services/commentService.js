const { Comment, User } = require("../models/index");

class CommentService {
  async create(data) {
    try {
      return await Comment.create(data);
    } catch (error) {
      console.error("Lỗi Service Create Comment:", error.message);
      throw error;
    }
  }
  async delete(id) {
    try {
      return await Comment.destroy({
        where: { id: id },
      });
    } catch (error) {
      console.error("Lỗi Service Delete Comment:", error.message);
      throw error;
    }
  }
  async getByPostId(postId) {
    try {
      return await Comment.findAll({
        where: { postId: postId },
        include: [{ model: User, as: "author", attributes: ["name"] }],
        order: [["id", "DESC"]],
      });
    } catch (error) {
      console.error("Lỗi Service Get Comments:", error.message);
      throw error;
    }
  }
  async update(id, content) {
    try {
      const comment = await Comment.findByPk(id);
      if (!comment) throw new Error("Không tìm thấy bình luận!");
      return await comment.update({ content });
    } catch (error) {
      console.error("Lỗi Service Update Comment:", error.message);
      throw error;
    }
  }
}

module.exports = new CommentService();
