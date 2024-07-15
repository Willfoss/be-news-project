const { fetchTopics } = require("../models/topic-models");

exports.getTopics = (request, response, next) => {
  fetchTopics()
    .then((topics) => {
      return response.send({ topics });
    })
    .catch((error) => {
      next(error);
    });
};
