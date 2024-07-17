const db = require("../db/connection");
const { articleData } = require("../db/data/test-data");

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

const fetchArticles = (sort_by = "created_at", order = "desc", topic) => {
  const validSortBys = ["article_id", "topic", "author", "votes", "created_at", "comment_count", "title"];
  const validOrders = ["asc", "desc", "ASC", "DESC"];
  const topicArray = [];

  let queryString = `SELECT articles.article_id, articles.author, articles.title, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id)::int AS comment_count FROM articles 
    LEFT JOIN comments ON comments.article_id=articles.article_id`;

  if (!validSortBys.includes(sort_by) || !validOrders.includes(order)) {
    return Promise.reject({ status: 400, message: "bad request" });
  }

  if (topic) {
    queryString += ` WHERE topic = $1`;
    topicArray.push(topic);
  }

  queryString += ` GROUP BY articles.article_id`;
  queryString += ` ORDER BY ${sort_by} ${order}`;

  return db.query(queryString, topicArray).then(({ rows }) => {
    return rows;
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

const insertArticle = (author, title, body, topic, article_img_url) => {
  if (!author || !title || !body || !topic) {
    return Promise.reject({ status: 400, message: "bad request" });
  }

  const insertArray = [author, title, body, topic];

  let queryString1 = `INSERT INTO articles (author, title, body, topic`;

  let queryString2 = `SELECT articles.*, COUNT(comments.comment_id)::int AS comment_count FROM articles 
  LEFT JOIN comments ON comments.article_id=articles.article_id
  WHERE (articles.author = $1
  AND articles.title = $2
  AND articles.body = $3
  AND articles.topic = $4`;

  if (article_img_url) {
    queryString1 += `, article_img_url) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
    queryString2 += ` AND articles.article_img_url= $5) GROUP BY articles.article_id`;
    insertArray.push(article_img_url);
  } else {
    queryString1 += `) VALUES ($1, $2, $3, $4) RETURNING *;`;
    queryString2 += `) GROUP BY articles.article_id`;
  }

  console.log(queryString1);
  console.log(queryString2);

  //WHY DOES THIS SOMETIMES WORK AND SOMETIMES NOT!?!?!?!
  // return Promise.all([db.query(queryString1, insertArray), db.query(queryString2, insertArray)]).then(([insertQuery, retrieveDataQuery]) => {
  //   console.log(insertQuery.rows, retrieveDataQuery.rows);
  //   return retrieveDataQuery.rows[0];
  // });

  // return db.query(queryString1, insertArray).then(() => {
  //   return db.query(queryString2, insertArray).then(({ rows }) => {
  //     return rows[0];
  //   });
  // });
};

module.exports = {
  fetchArticleById,
  fetchArticles,
  fetchArticleCommentsByArticleId,
  alterArticleByArticleId,
  insertCommentByArticleId,
  insertArticle,
};
