const articleRouter = require("express").Router();

const {
  getArticleById,
  getArticles,
  getArticleCommentsByArticleId,
  updateArticleByArticleId,
  addCommentByArticleId,
  addArticle,
} = require("../controllers/article-controller.js");

articleRouter.route("/").get(getArticles);
articleRouter.route("/").post(addArticle);
articleRouter.route("/:article_id").get(getArticleById);
articleRouter.route("/:article_id").patch(updateArticleByArticleId);
articleRouter.route("/:article_id/comments").get(getArticleCommentsByArticleId);
articleRouter.route("/:article_id/comments").post(addCommentByArticleId);

module.exports = articleRouter;
