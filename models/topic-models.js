const db = require("../db/connection");

const fetchTopics = () => {
  return db.query("SELECT * FROM topics;").then(({ rows }) => {
    return rows;
  });
};

const fetchTopicByTopic = (topic) => {
  return db.query("SELECT * FROM topics WHERE slug = $1;", [topic]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, message: "not found" });
    }
    return rows[0];
  });
};

const insertTopic = (slug, description) => {
  const queryString = `INSERT INTO topics (slug, description)
  VALUES ($1, $2) RETURNING *`;

  return db.query(queryString, [slug, description]).then(({ rows }) => {
    return rows[0];
  });
};

module.exports = { fetchTopicByTopic, fetchTopics, insertTopic };
