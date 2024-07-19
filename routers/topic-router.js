const topicRouter = require("express").Router();

const { getTopicByTopic, getTopics, addTopic, deleteTopicByTopic } = require("../controllers/topic-controllers");

topicRouter.route("/").get(getTopics);
topicRouter.route("/").post(addTopic);
topicRouter.route("/:topic").get(getTopicByTopic);
topicRouter.route("/:topic").delete(deleteTopicByTopic);

module.exports = topicRouter;
