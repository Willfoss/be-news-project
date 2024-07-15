const db = require("../db/connection");

exports.fetchArticleById = (id) => {
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

exports.fetchArticles = () => {
  const queryString = `SELECT articles.article_id, articles.author, articles.title, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id)::int AS comment_count FROM articles 
  LEFT JOIN comments ON comments.article_id=articles.article_id
  GROUP BY articles.article_id
  ORDER BY created_at DESC`;
  return db.query(queryString).then(({ rows }) => {
    return rows;
  });
};

exports.fetchArticleCommentsByArticleId = (id) => {
  const queryString = `SELECT * FROM comments 
  WHERE article_id = $1
  ORDER BY created_at ASC`;
  return db.query(queryString, [id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, message: "not found" });
    }
    return rows;
  });
};
