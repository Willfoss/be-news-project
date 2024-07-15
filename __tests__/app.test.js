const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");
const request = require("supertest");

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
