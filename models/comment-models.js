const db = require("../db/connection");

const removeComment = (id) => {
  const queryString = `DELETE FROM comments WHERE comment_id = $1`;
  return db.query(queryString, [id]).then(({ rowCount }) => {
    if (rowCount === 0) {
      return Promise.reject({ status: 404, message: "not found" });
    }
  });
};

module.exports = { removeComment };
