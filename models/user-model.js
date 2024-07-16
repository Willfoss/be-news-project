const db = require("../db/connection");

const fetchUsers = () => {
  const queryString = `SELECT * FROM users`;

  return db.query(queryString).then(({ rows }) => {
    return rows;
  });
};

module.exports = { fetchUsers };
