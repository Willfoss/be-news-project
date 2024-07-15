exports.customErrorHandler = (error, request, response, next) => {
  if (error.status && error.message) {
    response.status(error.status).send({ message: error.message });
  } else {
    next(error);
  }
};

exports.psqlErrorHandler = (error, request, response, next) => {
  if (error.code === "22P02") {
    response.status(400).send({ message: "bad request" });
  }
};

exports.serverErrorHandler = (error, request, response, next) => {
  console.log(error);
  response.status(500).send({ message: "internal server error" });
};
