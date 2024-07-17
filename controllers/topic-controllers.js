const { fetchTopics, fetchTopicByTopic } = require("../models/topic-models");

const getTopics = (request, response, next) => {
  fetchTopics()
    .then((topics) => {
      return response.send({ topics });
    })
    .catch((error) => {
      next(error);
    });
};

const getTopicByTopic = (request, response, next) => {
  const { topic } = request.params;
  fetchTopicByTopic(topic)
    .then((topic) => {
      return response.send({ topic });
    })
    .catch((error) => {
      next(error);
    });
};

module.exports = { getTopics, getTopicByTopic };
