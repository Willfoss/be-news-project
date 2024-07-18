const topicRouter = require("express").Router();

const { getTopicByTopic, getTopics, addTopic } = require("../controllers/topic-controllers");

topicRouter.route("/").get(getTopics);
topicRouter.route("/").post(addTopic);
topicRouter.route("/:topic").get(getTopicByTopic);

module.exports = topicRouter;
