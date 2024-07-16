const db = require("../db/connection");

const insertComment = (commentObj, id) => {
  const { username, body } = commentObj;

  if (!username || !body) {
    return Promise.reject({ status: 400, message: "bad request" });
  }

  const queryString = `INSERT INTO comments (article_id, author, body)
    VALUES ($1, $2, $3) RETURNING *`;

  return db.query(queryString, [id, username, body]).then(({ rows }) => {
    return rows[0];
  });
};

module.exports = { insertComment };
