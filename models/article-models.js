const db = require("../db/connection");

const fetchArticleById = (id) => {
  return db
    .query(
      `SELECT articles.* , COUNT(comments.comment_id)::int as comment_count FROM articles
        LEFT JOIN comments on comments.article_id=articles.article_id
        WHERE articles.article_id = $1
        GROUP BY articles.article_id`,
      [id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "not found" });
      }
      return rows[0];
    });
};

const fetchArticles = (sort_by = "created_at", order = "desc", topic, author, limit = 10, page = 1) => {
  const validSortBys = ["article_id", "topic", "author", "votes", "created_at", "comment_count", "title"];
  const validOrders = ["asc", "desc", "ASC", "DESC"];
  const queryArray = [];

  let queryString1 = `SELECT articles.article_id, articles.author, articles.title, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id)::int AS comment_count FROM articles 
    LEFT JOIN comments ON comments.article_id=articles.article_id`;

  let queryString2 = "SELECT article_id FROM articles";

  if (!validSortBys.includes(sort_by) || !validOrders.includes(order) || Number.isNaN(+limit) || Number.isNaN(+page)) {
    return Promise.reject({ status: 400, message: "bad request" });
  }

  if (topic && author) {
    queryString1 += ` WHERE articles.topic = $1 AND articles.author = $2`;
    queryString2 += ` WHERE articles.topic = $1 AND articles.author = $2`;
    queryArray.push(topic);
    queryArray.push(author);
  } else if (topic && !author) {
    queryString1 += ` WHERE articles.topic = $1`;
    queryString2 += ` WHERE articles.topic = $1`;
    queryArray.push(topic);
  } else if (author && !topic) {
    queryString1 += ` WHERE articles.author = $1`;
    queryString2 += ` WHERE articles.author = $1`;
    queryArray.push(author);
  }

  const offset = (page - 1) * limit;

  queryString1 += ` GROUP BY articles.article_id 
  ORDER BY ${sort_by} ${order}, articles.article_id ${order} 
  LIMIT ${limit} 
  OFFSET ${offset}`;

  return db
    .query(queryString1, queryArray)
    .then(({ rows }) => {
      return Promise.all([db.query(queryString2, queryArray), rows]);
    })
    .then(([{ rows }, queriedArticles]) => {
      const totalCount = rows.length;
      const numberOfRequiredPages = Math.ceil(totalCount / limit);
      if (page > numberOfRequiredPages && numberOfRequiredPages > 0) {
        return Promise.reject({ status: 404, message: "not found" });
      }
      return Promise.all([queriedArticles, totalCount]);
    });
};

const insertCommentByArticleId = (commentObj, id) => {
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

const fetchArticleCommentsByArticleId = (id, limit = 10, page = 1) => {
  const offset = limit * page - limit;

  const queryString = `SELECT * FROM comments 
  WHERE article_id = $1
  ORDER BY created_at ASC
  LIMIT ${limit}
  OFFSET ${offset}`;

  if (Number.isNaN(+limit) || Number.isNaN(+page) || limit < 3 || limit > 25) {
    return Promise.reject({ status: 400, message: "bad request" });
  }

  const promiseArray = [fetchArticleById(id), db.query(queryString, [id])];

  return Promise.all(promiseArray).then(([checkArticleExists, query]) => {
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

const insertArticle = (author, title, body, topic, article_img_url) => {
  if (!author || !title || !body || !topic) {
    return Promise.reject({ status: 400, message: "bad request" });
  }

  const articlePropertyArray = [author, title, body, topic];

  let queryString1 = `INSERT INTO articles (author, title, body, topic`;

  let queryString2 = `SELECT articles.*, COUNT(comments.comment_id)::int AS comment_count FROM articles 
  LEFT JOIN comments ON comments.article_id=articles.article_id
  WHERE articles.article_id = $1
  GROUP BY articles.article_id`;

  if (article_img_url) {
    queryString1 += `, article_img_url) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
    articlePropertyArray.push(article_img_url);
  } else {
    queryString1 += `) VALUES ($1, $2, $3, $4) RETURNING *;`;
  }

  return db
    .query(queryString1, articlePropertyArray)
    .then(({ rows }) => {
      return db.query(queryString2, [rows[0].article_id]);
    })
    .then(({ rows }) => {
      return rows[0];
    });
};

const removeArticle = (id) => {
  const queryString = `DELETE FROM articles WHERE article_id = $1`;

  return db.query(queryString, [id]).then(({ rowCount }) => {
    if (rowCount === 0) {
      return Promise.reject({ status: 404, message: "not found" });
    }
  });
};

module.exports = {
  fetchArticleById,
  fetchArticles,
  fetchArticleCommentsByArticleId,
  alterArticleByArticleId,
  insertCommentByArticleId,
  insertArticle,
  removeArticle,
};
