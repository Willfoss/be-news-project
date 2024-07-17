const commentRouter = require("express").Router();

const { deleteComment } = require("../controllers/comment-controllers");

commentRouter.route("/:comment_id").delete(deleteComment);

module.exports = commentRouter;
