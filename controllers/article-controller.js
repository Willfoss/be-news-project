const { fetchArticleById, fetchArticles } = require("../models/article-models");

exports.getArticleById = (request, response, next) => {
  const { articleId } = request.params;
  fetchArticleById(articleId)
    .then((article) => {
      return response.send({ article });
    })
    .catch((error) => {
      next(error);
    });
};

exports.getArticles = (request, response, next) => {
  fetchArticles()
    .then((articles) => {
      return response.send({ articles });
    })
    .catch((error) => {
      next(error);
    });
};
