const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");
const request = require("supertest");
const endpoints = require("../endpoints.json");
const { convertTimestampToDate } = require("../db/seeds/utils");

beforeEach(() => seed(data));

afterAll(() => db.end());

describe("/api/topics testing", () => {
  describe("GET", () => {
    test("GET 200: returns an array of topic objects that contain a slug and description property ", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body }) => {
          expect(body.topics.length).toBe(3);
          body.topics.forEach((topic) => {
            expect(topic).toMatchObject({
              slug: expect.any(String),
              description: expect.any(String),
            });
          });
        });
    });
  });
});

describe("/api", () => {
  describe("GET", () => {
    test("GET 200: returns an object containing all available endpoints of the API", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then(({ body }) => {
          expect(body.endpoints).toEqual(endpoints);
        });
    });
  });
});

describe("/api/articles/:article_id", () => {
  describe("GET", () => {
    test("GET 200: responds with an object with details of the article to the client", () => {
      return request(app)
        .get("/api/articles/3")
        .expect(200)
        .then(({ body }) => {
          //tried to do this as an exact equal but had a nightmare with converting time. i would argue this is still a sufficient test
          expect(body.article).toMatchObject({
            article_id: 3,
            title: "Eight pug gifs that remind me of mitch",
            topic: "mitch",
            author: "icellusedkars",
            body: "some gifs",
            votes: expect.any(Number),
            created_at: expect.any(String),
            article_img_url: expect.any(String),
          });
        });
    });
    test("GET 400: responds with a bad request error message when trying to provide an article id as the wrong data type", () => {
      return request(app)
        .get("/api/articles/three")
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("bad request");
        });
    });
    test("GET 404: responds with a not found error message when trying to provide an article id as the correct data type but it does not exist in the db", () => {
      return request(app)
        .get("/api/articles/999999")
        .expect(404)
        .then(({ body }) => {
          expect(body.message).toBe("not found");
        });
    });
  });
});

describe("/api/articles", () => {
  describe("GET", () => {
    test("GET 200: responds with an array of articles objects to the client including a comment count and excluding the article body", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(13);
          body.articles.forEach((article) => {
            expect(article).toMatchObject({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(Number),
            });
            expect(article.hasOwnProperty("body")).toBe(false);
          });
        });
    });
    test("GET 200: The array that is returned is sorted by default in descending order by its creation date", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("created_at", { descending: true });
        });
    });
  });
  describe("GET QUERIES - order", () => {
    test("order ASC 200: responds with an array of article objects sorted in ascending order when ASC is specified and defaults to created_at if no sort_by provided", () => {
      return request(app)
        .get("/api/articles?order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(13);
          expect(body.articles).toBeSortedBy("created_at");
        });
    });
    test("order DESC 200: responds with an array of article objects sorted in ascending order when ASC is specified and defaults to created_at if no sort_by provided", () => {
      return request(app)
        .get("/api/articles?order=desc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(13);
          expect(body.articles).toBeSortedBy("created_at", { descending: true });
        });
    });
    test("order 400: responds with a bad request message when an invalid query is given", () => {
      return request(app)
        .get("/api/articles?order=i-am-an-invalid-query")
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("bad request");
        });
    });
  });
  describe("GET QUERIES - sort_by", () => {
    test("sort_by article_id 200: responds with an array of article objects sorted by article_id and by default is ordered in descending order", () => {
      return request(app)
        .get("/api/articles?sort_by=article_id")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(13);
          expect(body.articles).toBeSortedBy("article_id", { descending: true });
        });
    });
    test("sort_by topic 200: responds with an array of article objects sorted by topics and by default is ordered in descending alphabetical order", () => {
      return request(app)
        .get("/api/articles?sort_by=topic")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(13);
          expect(body.articles).toBeSortedBy("topic", { descending: true });
        });
    });
    test("sort_by author 200: responds with an array of article objects sorted by authors and by default is ordered in descending alphabetical order", () => {
      return request(app)
        .get("/api/articles?sort_by=author")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(13);
          expect(body.articles).toBeSortedBy("author", { descending: true });
        });
    });
    test("sort_by votes 200: responds with an array of article objects sorted by number of votes and by default is ordered in descending order", () => {
      return request(app)
        .get("/api/articles?sort_by=votes")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(13);
          expect(body.articles).toBeSortedBy("votes", { descending: true });
        });
    });
    test("sort_by created_at 200: responds with an array of article objects sorted by creation date and by default is ordered in descending order", () => {
      return request(app)
        .get("/api/articles?sort_by=created_at")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(13);
          expect(body.articles).toBeSortedBy("created_at", { descending: true });
        });
    });
    test("sort_by comment_count 200: responds with an array of article objects sorted by number of comments and by default is ordered in descending order", () => {
      return request(app)
        .get("/api/articles?sort_by=comment_count")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(13);
          expect(body.articles).toBeSortedBy("comment_count", { descending: true });
        });
    });
    test("sort_by title 200: responds with an array of article objects sorted in descending title alphabetical order by default", () => {
      return request(app)
        .get("/api/articles?sort_by=title")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(13);
          expect(body.articles).toBeSortedBy("title", { descending: true });
        });
    });
    test("sort_by & order 400: responds with a bad request error message when given an invalid sort_by query", () => {
      return request(app)
        .get("/api/articles?sort_by=i-am-an-invalid-query")
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("bad request");
        });
    });
  });
  describe("GET QUERIES - sort_by & order", () => {
    test("sort_by article_id ASC 200: responds with an array of article objects sorted by article_id and by ascending order when specified", () => {
      return request(app)
        .get("/api/articles?sort_by=article_id&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(13);
          expect(body.articles).toBeSortedBy("article_id");
        });
    });

    test("sort_by & order topic ASC 200: responds with an array of article objects sorted by topics and by ascending alphbetical order when specified", () => {
      return request(app)
        .get("/api/articles?sort_by=topic&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(13);
          expect(body.articles).toBeSortedBy("topic");
        });
    });

    test("sort_by & order author ASC 200: responds with an array of article objects sorted by authors and by ascending alphbetical order when specified", () => {
      return request(app)
        .get("/api/articles?sort_by=author&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(13);
          expect(body.articles).toBeSortedBy("author");
        });
    });

    test("sort_by & order votes ASC 200: responds with an array of article objects sorted by number of votes and by ascending  order when specified", () => {
      return request(app)
        .get("/api/articles?sort_by=votes&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(13);
          expect(body.articles).toBeSortedBy("votes");
        });
    });

    test("sort_by & order created_at ASC 200: responds with an array of article objects sorted by creation date by ascending  order when specified", () => {
      return request(app)
        .get("/api/articles?sort_by=created_at&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(13);
          expect(body.articles).toBeSortedBy("created_at");
        });
    });

    test("sort_by & order comment_count ASC 200: responds with an array of article objects sorted by number of comments by ascending  order when specified", () => {
      return request(app)
        .get("/api/articles?sort_by=comment_count&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(13);
          expect(body.articles).toBeSortedBy("comment_count");
        });
    });

    test("sort_by & order title ASC 200: responds with an array of article objects sorted alphabetically by title when asc specified", () => {
      return request(app)
        .get("/api/articles?sort_by=title&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(13);
          expect(body.articles).toBeSortedBy("title");
        });
    });
    test("sort_by & order 400: responds with a bad request error message when given an invalid order or sort by query", () => {
      return request(app)
        .get("/api/articles?sort_by=i-am-an-invalid-query&order=asc")
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("bad request");
        });
    });
  });
});

describe("/api/articles/:article_id/comments)", () => {
  describe("GET", () => {
    test("GET 200: responds with an array of comments objects from a particular article to the client", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments.length).toBe(11);
          body.comments.forEach((comment) => {
            expect(comment).toMatchObject({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              article_id: 1,
            });
          });
        });
    });
    test("GET 200: the objects within the array are sorted by the most recent comments first", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments).toBeSortedBy("created_at");
        });
    });
    test("GET 200: responds with an empty array when the article id provided exists and is the correct data type but the article has no comments ", () => {
      return request(app)
        .get("/api/articles/8/comments")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments).toEqual([]);
        });
    });
    test("GET 400: responds with a bad request error message when the article id is provided as the wrong data type", () => {
      return request(app)
        .get("/api/articles/one/comments")
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("bad request");
        });
    });
    test("GET 404: responds with a not found error message when the article id is provided as the correct data type but is out of range of the db", () => {
      return request(app)
        .get("/api/articles/99999/comments")
        .expect(404)
        .then(({ body }) => {
          expect(body.message).toBe("not found");
        });
    });
  });
  describe("POST", () => {
    test("POST 201: responds to the client with the comment that has been posted", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({ username: "butter_bridge", body: "what do you call a man with a seagull on his head?" })
        .expect(201)
        .then(({ body }) => {
          expect(body.comment).toMatchObject({
            comment_id: 19,
            article_id: 1,
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: "butter_bridge",
            body: "what do you call a man with a seagull on his head?",
          });
        });
    });
    test("POST 201: it ignores any additional information included in the send request", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({ username: "butter_bridge", body: "what do you call a man with a seagull on his head?", answer: "Cliff" })
        .expect(201)
        .then(({ body }) => {
          expect(body.comment.hasOwnProperty("answer")).toBe(false);
        });
    });
    test("POST 400: responds with a bad request error message when the article id is provided as the wrong data type", () => {
      return request(app)
        .post("/api/articles/one/comments")
        .send({ username: "butter_bridge", body: "what do you call a man with a seagull on his head?" })
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("bad request");
        });
    });
    test("POST 400: responds with a bad request error message when a required bit of information is missing", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({ body: "what do you call a man with a seagull on his head?" })
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("bad request");
        });
    });
    test("POST 404: responds with a not found error message when the user does not exist", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({ username: "Cliff", body: "What do you call a man with a seagull on his head?" })
        .expect(404)
        .then(({ body }) => {
          expect(body.message).toBe("not found");
        });
    });
    test("POST 404: responds with a not found error message when the article id is the correct data type but does not exist in the db", () => {
      return request(app)
        .post("/api/articles/999/comments")
        .send({ username: "butter_bridge", body: "what do you call a man with a seagull on his head?" })
        .expect(404)
        .then(({ body }) => {
          expect(body.message).toBe("not found");
        });
    });
  });
  describe("PATCH", () => {
    test("PATCH 200: responds with an article object to the client that contains an updated incremental votes value when the vote is positive", () => {
      return request(app)
        .patch("/api/articles/3")
        .send({ inc_votes: 1 })
        .expect(200)
        .then(({ body }) => {
          expect(body.updated_article).toMatchObject({
            article_id: 3,
            title: "Eight pug gifs that remind me of mitch",
            topic: "mitch",
            author: "icellusedkars",
            body: "some gifs",
            votes: 1,
            created_at: expect.any(String),
            article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          });
        });
    });
    test("PATCH 200: responds with an article object to the client that contains an updated decremental votes value when the vote is negative", () => {
      return request(app)
        .patch("/api/articles/1")
        .send({ inc_votes: -1 })
        .expect(200)
        .then(({ body }) => {
          expect(body.updated_article).toMatchObject({
            article_id: 1,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: expect.any(String),
            votes: 99,
            article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          });
        });
    });
    test("PATCH 200: the returned object ignores any unnecessary properties", () => {
      return request(app)
        .patch("/api/articles/3")
        .send({ inc_votes: 1, apple: "pink lady" })
        .expect(200)
        .then(({ body }) => {
          expect(body.updated_article.hasOwnProperty("apple")).toBe(false);
        });
    });
    test("Patch 400: responds with a bad request error message if article id is of the wrong data type", () => {
      return request(app)
        .patch("/api/articles/three")
        .send({ inc_votes: 1 })
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("bad request");
        });
    });
    test("Patch 400: responds with a bad request error message if inc_votes property missing from request", () => {
      return request(app)
        .patch("/api/articles/3")
        .send({ apple: "pink lady" })
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("bad request");
        });
    });
    test("Patch 400: responds with a bad request error message if inc_votes value is provided as the wrong data type", () => {
      return request(app)
        .patch("/api/articles/3")
        .send({ inc_votes: "one" })
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("bad request");
        });
    });
    test("Patch 404: responds with a not found error message if the article id is of the correct data type but does not yet exist in the db", () => {
      return request(app)
        .patch("/api/articles/999")
        .send({ inc_votes: 1 })
        .expect(404)
        .then(({ body }) => {
          expect(body.message).toBe("not found");
        });
    });
  });
});

describe("/api/comments/:comment_id tests", () => {
  describe("DELETE", () => {
    test("DELETE 204: responds with a 204 status after successful deletion", () => {
      return request(app).delete("/api/comments/2").expect(204);
    });
    test("DELETE 400: responds with bad request error message if passed an invalid comment_id data type", () => {
      return request(app).delete("/api/comments/two").expect(400);
    });
    test("DELETE 404: responds with not found error message if passed a comment id of the correct data type but does not yet exist in the db", () => {
      return request(app).delete("/api/comments/99").expect(404);
    });
  });
});

describe("/api/users testing", () => {
  describe("GET", () => {
    test("GET 200: responds with an array of user objects contains properties about the user", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then(({ body }) => {
          expect(body.users.length).toBe(4);
          body.users.forEach((user) => {
            expect(user).toMatchObject({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            });
          });
        });
    });
  });
});

describe("api path does not exist tests", () => {
  test("returns a 404 status and an error message when given an invalid api path", () => {
    return request(app)
      .get("/api/i-do-not-exist")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("path not found");
      });
  });
});
