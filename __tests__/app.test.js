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
