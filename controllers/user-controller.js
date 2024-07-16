const { fetchUsers } = require("../models/user-model");

const getUsers = (request, response, next) => {
  fetchUsers()
    .then((users) => {
      return response.send({ users });
    })
    .catch((error) => {
      return error;
    });
};

module.exports = { getUsers };
