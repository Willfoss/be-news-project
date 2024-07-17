const { removeComment, alterComment } = require("../models/comment-models");

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

const updateComment = (request, response, next) => {
  const { comment_id } = request.params;
  const { inc_votes } = request.body;
  alterComment(comment_id, inc_votes)
    .then((comment) => {
      return response.send({ updatedComment: comment });
    })
    .catch((error) => {
      next(error);
    });
};

module.exports = { deleteComment, updateComment };
