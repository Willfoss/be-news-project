const { fetchTopics, fetchTopicByTopic, insertTopic, removeTopicByTopic } = require("../models/topic-models");

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

const addTopic = (request, response, next) => {
  const { slug, description } = request.body;
  insertTopic(slug, description)
    .then((topic) => {
      response.status(201).send({ topic });
    })
    .catch((error) => {
      next(error);
    });
};

const deleteTopicByTopic = (request, response, next) => {
  const { topic } = request.params;
  removeTopicByTopic(topic)
    .then(() => {
      return response.sendStatus(204);
    })
    .catch((error) => {
      next(error);
    });
};

module.exports = { getTopics, getTopicByTopic, addTopic, deleteTopicByTopic };
