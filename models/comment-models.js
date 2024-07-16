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

const removeComment = (id) => {
  const queryString = `DELETE FROM comments WHERE comment_id = $1`;
  return db.query(queryString, [id]).then(({ rowCount }) => {
    if (rowCount === 0) {
      return Promise.reject({ status: 404, message: "not found" });
    }
  });
};

module.exports = { insertComment, removeComment };
