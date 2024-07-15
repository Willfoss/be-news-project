const express = require("express");
const app = express();
const { getTopics, invalidEndpoint } = require("./controllers/topic-controllers.js");
const { serverErrorHandler } = require("./error-handling.js");

app.get("/api/topics", getTopics);

app.all("*", (request, response) => {
  response.status(404).send({ message: "path not found" });
});

app.use(serverErrorHandler);

module.exports = app;
