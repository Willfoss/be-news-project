const { getArticleById } = require("../controllers/article-controller");
const db = require("../db/connection");

const fetchArticleById = (id) => {
  return db
    .query(
      `SELECT articles.* FROM articles
        WHERE articles.article_id = $1`,
      [id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "not found" });
      }
      return rows[0];
    });
};

const fetchArticles = () => {
  const queryString = `SELECT articles.article_id, articles.author, articles.title, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id)::int AS comment_count FROM articles 
  LEFT JOIN comments ON comments.article_id=articles.article_id
  GROUP BY articles.article_id
  ORDER BY created_at DESC`;
  return db.query(queryString).then(({ rows }) => {
    return rows;
  });
};

//been debating if this one should go into the comments controller and have good arguments for either case. any feedback on this welcomed
const fetchArticleCommentsByArticleId = (id) => {
  const queryString = `SELECT * FROM comments 
  WHERE article_id = $1
  ORDER BY created_at ASC`;
  const promiseArray = [fetchArticleById(id), db.query(queryString, [id])];

  return Promise.all(promiseArray).then(([checkArticleExists, query]) => {
    if (!checkArticleExists) {
      return Promise.reject({ status: 404, message: "not found" });
    }
    return query.rows;
  });
};

const alterArticleByArticleId = (id, votes) => {
  if (!votes) {
    return Promise.reject({ status: 400, message: "bad request" });
  }
  const queryString = `UPDATE articles
  SET votes = votes + $1
  WHERE article_id = $2
  RETURNING *`;
  return db.query(queryString, [votes, id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, message: "not found" });
    }
    return rows[0];
  });
};

module.exports = { fetchArticleById, fetchArticles, fetchArticleCommentsByArticleId, alterArticleByArticleId };
