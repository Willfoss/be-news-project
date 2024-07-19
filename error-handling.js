const customErrorHandler = (error, request, response, next) => {
  if (error.status && error.message) {
    response.status(error.status).send({ message: error.message });
  } else {
    next(error);
  }
};

const psqlErrorHandler = (error, request, response, next) => {
  if (error.code === "22P02" || error.code === "23502") {
    response.status(400).send({ message: "bad request" });
  } else if (error.code === "23503") {
    response.status(404).send({ message: "not found" });
  } else {
    next(error);
  }
};

const serverErrorHandler = (error, request, response, next) => {
  console.log(error);
  response.status(500).send({ message: "internal server error" });
};

module.exports = { customErrorHandler, psqlErrorHandler, serverErrorHandler };
