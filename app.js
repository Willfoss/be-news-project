const express = require("express");
const app = express();
const apiRouter = require("./routes/api-router.js");
//const { getTopics, getTopicByTopic } = require("./controllers/topic-controllers.js");
const { getApiList } = require("./controllers/api-controllers.js");

const { serverErrorHandler, customErrorHandler, psqlErrorHandler } = require("./error-handling.js");

app.use(express.json());

app.use("/api", apiRouter);

app.all("*", (request, response) => {
  response.status(404).send({ message: "path not found" });
});

app.use(customErrorHandler);

app.use(psqlErrorHandler);

app.use(serverErrorHandler);

module.exports = app;
