const postService = require("../services/postService");

exports.index = async (req, res) => {
  try {
    const posts = await postService.getPublishedPosts();
    res.render("index", {
      siteName: "My Blog",
      posts,
    });
  } catch (error) {
    console.error("Home index error:", error);
    res.status(500).send("Không thể tải trang chủ");
  }
};

exports.detail = async (req, res) => {
  try {
    const post = await postService.getDetail(req.params.slug);

    if (!post) {
      return res.status(404).render("errors/404", {
        message: "Bài viết không tồn tại hoặc chưa được công khai",
      });
    }

    await postService.incrementView(post.id);

    res.render("post-detail", {
      siteName: "My Blog",
      post,
    });
  } catch (error) {
    console.error("Home detail error:", error);
    res.status(500).send("Không thể tải bài viết");
  }
};
