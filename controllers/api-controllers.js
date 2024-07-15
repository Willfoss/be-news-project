const endpoints = require("../endpoints.json");

exports.getApiList = (request, response, next) => {
  return response.send({ endpoints });
};
