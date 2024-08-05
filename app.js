const express = require("express");
const app = express();
const apiRouter = require("./routers/api-router.js");
const { serverErrorHandler, customErrorHandler, psqlErrorHandler } = require("./error-handling.js");
const cors = require("cors");

app.use(cors());

app.use(express.json());

app.use("/api", apiRouter);

app.all("*", (request, response) => {
  response.status(404).send({ message: "path not found" });
});

app.use(customErrorHandler);

app.use(psqlErrorHandler);

app.use(serverErrorHandler);

module.exports = app;
