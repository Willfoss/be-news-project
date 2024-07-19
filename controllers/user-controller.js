const { fetchUsers, fetchUserByUsername, removeUserByUsername, insertUser } = require("../models/user-model");

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

const addUser = (request, response, next) => {
  const { username, name, avatar_url } = request.body;
  insertUser(username, name, avatar_url)
    .then((user) => {
      return response.status(201).send({ user });
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

module.exports = { getUsers, getUserByUsername, deleteUserByUsername, addUser };
