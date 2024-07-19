const db = require("../db/connection");

const fetchUsers = () => {
  const queryString = `SELECT * FROM users`;

  return db.query(queryString).then(({ rows }) => {
    return rows;
  });
};

const fetchUserByUsername = (id) => {
  const queryString = `SELECT * FROM USERS
  WHERE username = $1`;

  return db.query(queryString, [id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, message: "not found" });
    }
    return rows[0];
  });
};

const removeUserByUsername = (username) => {
  const queryString = `DELETE FROM users WHERE username = $1`;

  return db.query(queryString, [username]).then(({ rowCount }) => {
    if (rowCount === 0) {
      return Promise.reject({ status: 404, message: "not found" });
    }
  });
};

module.exports = { fetchUsers, fetchUserByUsername, removeUserByUsername };
