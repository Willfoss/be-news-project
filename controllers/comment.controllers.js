const { insertComment } = require("../models/comment-models");

exports.addComment = (request, response, next) => {
  const { body } = request;
  const { article_id } = request.params;
  insertComment(body, article_id)
    .then((comment) => {
      return response.status(201).send({ comment });
    })
    .catch((error) => {
      next(error);
    });
};
