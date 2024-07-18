const topicRouter = require("express").Router();

const { getTopicByTopic, getTopics } = require("../controllers/topic-controllers");

topicRouter.route("/").get(getTopics);
topicRouter.route("/:topic").get(getTopicByTopic);

module.exports = topicRouter;
