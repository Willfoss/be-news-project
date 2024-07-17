const { fetchArticleById, fetchArticles, fetchArticleCommentsByArticleId, alterArticleByArticleId } = require("../models/article-models");
const { fetchTopic } = require("../models/topic-models");

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
  const { sort_by, order, topic } = request.query;
  if (topic) {
    Promise.all([fetchTopic(topic), fetchArticles(sort_by, order, topic)])
      .then(([doesTopicExists, articles]) => {
        if (!doesTopicExists) {
          return response.status(404).send({ message: "not found" });
        }
        return response.send({ articles });
      })
      .catch((error) => {
        next(error);
      });
  } else {
    fetchArticles(sort_by, order, topic)
      .then((articles) => {
        return response.send({ articles });
      })
      .catch((error) => {
        next(error);
      });
  }
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

exports.updateArticleByArticleId = (request, response, next) => {
  const { article_id } = request.params;
  const { inc_votes } = request.body;
  alterArticleByArticleId(article_id, inc_votes)
    .then((article) => {
      return response.send({ updated_article: article });
    })
    .catch((error) => {
      next(error);
    });
};
