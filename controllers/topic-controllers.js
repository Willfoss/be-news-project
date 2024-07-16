const { fetchTopics, fetchTopic } = require("../models/topic-models");

exports.getTopics = (request, response, next) => {
  fetchTopics()
    .then((topics) => {
      return response.send({ topics });
    })
    .catch((error) => {
      next(error);
    });
};

exports.getTopic = (request, response, next) => {
  const { topic } = request.params;
  fetchTopic(topic)
    .then((topic) => {
      return response.send({ topic });
    })
    .catch((error) => {
      next(error);
    });
};
