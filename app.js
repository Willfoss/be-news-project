const express = require("express");
const app = express();
const { getTopics } = require("./controllers/topic-controllers.js");
const { getApiList } = require("./controllers/api-controllers.js");
const { getArticleById } = require("./controllers/article-controller.js");
const { serverErrorHandler, customErrorHandler, psqlErrorHandler } = require("./error-handling.js");

app.get("/api/topics", getTopics);

app.get("/api", getApiList);

app.get("/api/articles/:articleId", getArticleById);

app.all("*", (request, response) => {
  response.status(404).send({ message: "path not found" });
});

app.use(customErrorHandler);

app.use(psqlErrorHandler);

app.use(serverErrorHandler);

module.exports = app;
