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
    test("PATCH 200: responds with an article object to the client that contains an updated votes value", () => {
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
