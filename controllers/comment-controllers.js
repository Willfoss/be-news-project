const { removeComment } = require("../models/comment-models");

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

module.exports = { deleteComment };
