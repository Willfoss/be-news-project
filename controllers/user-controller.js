const { fetchUsers, fetchUserByUsername, removeUserByUsername } = require("../models/user-model");

const getUsers = (request, response, next) => {
  fetchUsers()
    .then((users) => {
      return response.send({ users });
    })
    .catch((error) => {
      return error;
    });
};

const getUserByUsername = (request, response, next) => {
  const { username } = request.params;
  fetchUserByUsername(username)
    .then((user) => {
      return response.send({ user });
    })
    .catch((error) => {
      next(error);
    });
};

const deleteUserByUsername = (request, response, next) => {
  const { username } = request.params;
  removeUserByUsername(username)
    .then(() => {
      return response.sendStatus(204);
    })
    .catch((error) => {
      next(error);
    });
};

module.exports = { getUsers, getUserByUsername, deleteUserByUsername };
