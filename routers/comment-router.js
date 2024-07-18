const commentRouter = require("express").Router();

const { deleteComment, updateComment } = require("../controllers/comment-controllers");

commentRouter.route("/:comment_id").delete(deleteComment);
commentRouter.route("/:comment_id").patch(updateComment);

module.exports = commentRouter;
