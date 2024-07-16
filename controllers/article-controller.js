const { fetchArticleById, fetchArticles, fetchArticleCommentsByArticleId } = require("../models/article-models");

exports.getArticleById = (request, response, next) => {
  const { article_id } = request.params;
  fetchArticleById(article_id)
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

//hmmm been debating if this one should go into the comments controller and have good arguments for either case. any feedback on this welcomed
exports.getArticleCommentsByArticleId = (request, response, next) => {
  const { article_id } = request.params;
  fetchArticleCommentsByArticleId(article_id)
    .then((comments) => {
      return response.send({ comments });
    })
    .catch((error) => {
      next(error);
    });
};
