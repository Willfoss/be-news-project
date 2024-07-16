const express = require("express");
const app = express();
const { getTopics } = require("./controllers/topic-controllers.js");
const { getApiList } = require("./controllers/api-controllers.js");
const { getArticleById, getArticles, getArticleCommentsByArticleId, updateArticleByArticleId } = require("./controllers/article-controller.js");
const { addComment, deleteComment } = require("./controllers/comment-controllers.js");
const { serverErrorHandler, customErrorHandler, psqlErrorHandler } = require("./error-handling.js");

app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api", getApiList);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id/comments", getArticleCommentsByArticleId);

app.post("/api/articles/:article_id/comments", addComment);

app.patch("/api/articles/:article_id", updateArticleByArticleId);

app.delete("/api/comments/:comment_id", deleteComment);

app.all("*", (request, response) => {
  response.status(404).send({ message: "path not found" });
});

app.use(customErrorHandler);

app.use(psqlErrorHandler);

app.use(serverErrorHandler);

module.exports = app;
