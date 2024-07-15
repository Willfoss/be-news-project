const { fetchArticleById } = require("../models/article-models");

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
