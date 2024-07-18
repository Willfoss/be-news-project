const {
  fetchArticleById,
  fetchArticles,
  fetchArticleCommentsByArticleId,
  alterArticleByArticleId,
  insertCommentByArticleId,
  insertArticle,
  removeArticle,
} = require("../models/article-models");
const { fetchTopicByTopic } = require("../models/topic-models");

const getArticleById = (request, response, next) => {
  const { article_id } = request.params;
  fetchArticleById(article_id)
    .then((article) => {
      return response.send({ article });
    })
    .catch((error) => {
      next(error);
    });
};

const getArticles = (request, response, next) => {
  const { sort_by, order, topic, limit, page } = request.query;

  if (topic) {
    Promise.all([fetchTopicByTopic(topic), fetchArticles(sort_by, order, topic, limit, page)])
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
    fetchArticles(sort_by, order, topic, limit, page)
      .then((articles) => {
        return response.send({ articles });
      })
      .catch((error) => {
        next(error);
      });
  }
};

//hmmm been debating if this one should go into the comments controller and have good arguments for either case. any feedback on this welcomed
const getArticleCommentsByArticleId = (request, response, next) => {
  const { article_id } = request.params;
  const { limit, page } = request.query;
  fetchArticleCommentsByArticleId(article_id, limit, page)
    .then((comments) => {
      return response.send({ comments });
    })
    .catch((error) => {
      next(error);
    });
};

const addCommentByArticleId = (request, response, next) => {
  const { body } = request;
  const { article_id } = request.params;
  insertCommentByArticleId(body, article_id)
    .then((comment) => {
      return response.status(201).send({ comment });
    })
    .catch((error) => {
      next(error);
    });
};

const updateArticleByArticleId = (request, response, next) => {
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

const addArticle = (request, response, next) => {
  const { author, title, body, topic, article_img_url } = request.body;
  insertArticle(author, title, body, topic, article_img_url)
    .then((article) => {
      return response.status(201).send({ article });
    })
    .catch((error) => {
      next(error);
    });
};

const deleteArticle = (request, response, next) => {
  const { article_id } = request.params;
  removeArticle(article_id)
    .then(() => {
      return response.sendStatus(204);
    })
    .catch((error) => {
      console.log(error);
      next(error);
    });
};

module.exports = {
  getArticleById,
  addCommentByArticleId,
  updateArticleByArticleId,
  getArticleCommentsByArticleId,
  getArticles,
  addArticle,
  deleteArticle,
};
