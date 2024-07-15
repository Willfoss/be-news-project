exports.serverErrorHandler = (request, response, next) => {
  console.log(error);
  response.status(500).send({ message: "internal server error" });
};
