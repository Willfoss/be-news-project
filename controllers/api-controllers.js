const endpoints = require("../endpoints.json");

const getApiList = (request, response, next) => {
  return response.send({ endpoints });
};

module.exports = { getApiList };
