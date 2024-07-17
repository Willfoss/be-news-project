const apiRouter = require("express").Router();

const { getApiList } = require("../controllers/api-controllers");
const articleRouter = require("./article-router");
const commentRouter = require("./comment-router");
const topicRouter = require("./topic-router");
const userRouter = require("./user-router");

apiRouter.use("/topics", topicRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/comments", commentRouter);
apiRouter.use("/articles", articleRouter);
apiRouter.route("/").get(getApiList);

module.exports = apiRouter;
