const { insertComment, removeComment } = require("../models/comment-models");

const addComment = (request, response, next) => {
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

const deleteComment = (request, response, next) => {
  const { comment_id } = request.params;
  removeComment(comment_id)
    .then(() => {
      return response.send(204);
    })
    .catch((error) => {
      next(error);
    });
};

module.exports = { addComment, deleteComment };
