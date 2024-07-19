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
  describe("POST", () => {
    test("POST 201: returns the new topic requested by the user", () => {
      return request(app)
        .post("/api/topics")
        .send({ slug: "hello", description: "my name is will" })
        .expect(201)
        .then(({ body }) => {
          expect(body.topic).toMatchObject({
            slug: "hello",
            description: "my name is will",
          });
        });
    });
    test("POST 201: ignores any extra properties sent in the request body", () => {
      return request(app)
        .post("/api/topics")
        .send({ slug: "hello", description: "my name is will", id: 4 })
        .expect(201)
        .then(({ body }) => {
          expect(body.topic).toMatchObject({
            slug: "hello",
            description: "my name is will",
          });
          expect(body.topic.hasOwnProperty("id")).toBe(false);
        });
    });
    test("POST 201: can be inserted with the description property missing", () => {
      return request(app)
        .post("/api/topics")
        .send({ slug: "hello" })
        .expect(201)
        .then(({ body }) => {
          expect(body.topic).toMatchObject({
            slug: "hello",
          });
        });
    });
    test("POST 400: sends a bad request message when the topic is sent with missing required properties", () => {
      return request(app)
        .post("/api/topics")
        .send({ description: "my name is will" })
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("bad request");
        });
    });
  });
});

describe("/api/topics/:topic", () => {
  describe("GET", () => {
    test("Get 200: returns a topic object that's associated with the provided topci", () => {
      return request(app)
        .get("/api/topics/mitch")
        .expect(200)
        .then(({ body }) => {
          expect(body.topic).toMatchObject({
            slug: "mitch",
            description: "The man, the Mitch, the legend",
          });
        });
    });
    test("GET 404: reponds with a not found message if sending an endpoint with the wrong data type", () => {
      return request(app)
        .get("/api/topics/i-do-not-exist")
        .expect(404)
        .then(({ body }) => {
          expect(body.message).toBe("not found");
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
    test("GET 200: responds with an object with details of the article to the client including comment count", () => {
      return request(app)
        .get("/api/articles/3")
        .expect(200)
        .then(({ body }) => {
          expect(body.article).toMatchObject({
            article_id: 3,
            title: "Eight pug gifs that remind me of mitch",
            topic: "mitch",
            author: "icellusedkars",
            body: "some gifs",
            votes: expect.any(Number),
            created_at: expect.any(String),
            article_img_url: expect.any(String),
            comment_count: 2,
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
  describe("DELETE", () => {
    test("DELETE 204: responds with a 204 status upon successful deletion for an article with no comments", () => {
      return request(app).delete("/api/articles/2").expect(204);
    });
    test("DELETE 204: responds with a 204 status upon successful deletion for an article with comments", () => {
      return request(app).delete("/api/articles/3").expect(204);
    });
    test("DELETE 400: responds with a bad request message when trying to delete an article using the wrong data type for article id", () => {
      return request(app)
        .delete("/api/articles/two")
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("bad request");
        });
    });
    test("DELETE 404: responds with a bad request message when trying to delete an article that does not yet exist in the db", () => {
      return request(app)
        .delete("/api/articles/999")
        .expect(404)
        .then(({ body }) => {
          expect(body.message).toBe("not found");
        });
    });
  });
});

describe("/api/articles", () => {
  describe("GET", () => {
    test("GET 200: responds with an array of articles objects to the client including a comment count and excluding the article body. it also sets the default amount of data retrieval to 10 by default", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(10);
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
          expect(body.articles.length).toBe(10);
          expect(body.articles).toBeSortedBy("created_at");
        });
    });
    test("order DESC 200: responds with an array of article objects sorted in ascending order when ASC is specified and defaults to created_at if no sort_by provided", () => {
      return request(app)
        .get("/api/articles?order=desc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(10);
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
          expect(body.articles.length).toBe(10);
          expect(body.articles).toBeSortedBy("article_id", { descending: true });
        });
    });
    test("sort_by topic 200: responds with an array of article objects sorted by topics and by default is ordered in descending alphabetical order", () => {
      return request(app)
        .get("/api/articles?sort_by=topic")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(10);
          expect(body.articles).toBeSortedBy("topic", { descending: true });
        });
    });
    test("sort_by author 200: responds with an array of article objects sorted by authors and by default is ordered in descending alphabetical order", () => {
      return request(app)
        .get("/api/articles?sort_by=author")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(10);
          expect(body.articles).toBeSortedBy("author", { descending: true });
        });
    });
    test("sort_by votes 200: responds with an array of article objects sorted by number of votes and by default is ordered in descending order", () => {
      return request(app)
        .get("/api/articles?sort_by=votes")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(10);
          expect(body.articles).toBeSortedBy("votes", { descending: true });
        });
    });
    test("sort_by created_at 200: responds with an array of article objects sorted by creation date and by default is ordered in descending order", () => {
      return request(app)
        .get("/api/articles?sort_by=created_at")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(10);
          expect(body.articles).toBeSortedBy("created_at", { descending: true });
        });
    });
    test("sort_by comment_count 200: responds with an array of article objects sorted by number of comments and by default is ordered in descending order", () => {
      return request(app)
        .get("/api/articles?sort_by=comment_count")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(10);
          expect(body.articles).toBeSortedBy("comment_count", { descending: true });
        });
    });
    test("sort_by title 200: responds with an array of article objects sorted in descending title alphabetical order by default", () => {
      return request(app)
        .get("/api/articles?sort_by=title")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(10);
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
          expect(body.articles.length).toBe(10);
          expect(body.articles).toBeSortedBy("article_id");
        });
    });

    test("sort_by & order topic ASC 200: responds with an array of article objects sorted by topics and by ascending alphbetical order when specified", () => {
      return request(app)
        .get("/api/articles?sort_by=topic&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(10);
          expect(body.articles).toBeSortedBy("topic");
        });
    });

    test("sort_by & order author ASC 200: responds with an array of article objects sorted by authors and by ascending alphbetical order when specified", () => {
      return request(app)
        .get("/api/articles?sort_by=author&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(10);
          expect(body.articles).toBeSortedBy("author");
        });
    });

    test("sort_by & order votes ASC 200: responds with an array of article objects sorted by number of votes and by ascending  order when specified", () => {
      return request(app)
        .get("/api/articles?sort_by=votes&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(10);
          expect(body.articles).toBeSortedBy("votes");
        });
    });

    test("sort_by & order created_at ASC 200: responds with an array of article objects sorted by creation date by ascending  order when specified", () => {
      return request(app)
        .get("/api/articles?sort_by=created_at&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(10);
          expect(body.articles).toBeSortedBy("created_at");
        });
    });

    test("sort_by & order comment_count ASC 200: responds with an array of article objects sorted by number of comments by ascending  order when specified", () => {
      return request(app)
        .get("/api/articles?sort_by=comment_count&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(10);
          expect(body.articles).toBeSortedBy("comment_count");
        });
    });

    test("sort_by & order title ASC 200: responds with an array of article objects sorted alphabetically by title when asc specified", () => {
      return request(app)
        .get("/api/articles?sort_by=title&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(10);
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
  describe("GET QUERIES - topic", () => {
    test("topic query 200: responds with an array of articles matching the topic query passed in", () => {
      return request(app)
        .get("/api/articles?topic=cats")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(1);
          body.articles.forEach((article) => {
            expect(article).toMatchObject({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              topic: "cats",
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(Number),
            });
          });
        });
    });
    test("topic query 200: responds with an empty array if searching for a topic that does exist but has no articles associated with it", () => {
      return request(app)
        .get("/api/articles?topic=paper")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toEqual([]);
        });
    });
    test("topic query 200: articles are ordered in descending order by created at by default", () => {
      return request(app)
        .get("/api/articles?topic=mitch")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("created_at", { descending: true });
        });
    });
    test("topic query 200: articles are ordered in ascending order by created at when order specified", () => {
      return request(app)
        .get("/api/articles?topic=mitch&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("created_at");
        });
    });
    test("topic query 200: aticles are ordered in descending order when picking a sort by and not specifiyng an order", () => {
      return request(app)
        .get("/api/articles?topic=mitch&sort_by=comment_count")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("comment_count", { descending: true });
        });
    });
    test("topic query 200: aticles are ordered in ascending order when picking a sort by and specifiyng an order", () => {
      return request(app)
        .get("/api/articles?topic=mitch&sort_by=comment_count&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("comment_count");
        });
    });
    test("topic query 404: responds with a not found message if no articles are found and the topic does not exist", () => {
      return request(app)
        .get("/api/articles?topic=dinnertime")
        .expect(404)
        .then(({ body }) => {
          expect(body.message).toBe("not found");
        });
    });
  });

  describe("GET query - limit and page", () => {
    test("limit & page 200: responds with an array of articles with the addition of a total article count property", () => {
      return request(app)
        .get("/api/articles?limit=5&page=3")
        .expect(200)
        .then(({ body }) => {
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
          });
          expect(body.total_count).toBe(13);
        });
    });
    test("limit & page 200: responds with an array of articles with the addition of a total article count property that shows the correct count when other queries are applied", () => {
      return request(app)
        .get("/api/articles?topic=mitch&limit=5&page=3")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(2);
          expect(body.total_count).toBe(12);
        });
    });
    test("limit & page 200: responds with an array of articles with the addition of a total article count property that shows the correct count when other queries are applied and sorted by the correct query", () => {
      return request(app)
        .get("/api/articles?topic=mitch&limit=5&page=3&sort_by=article_id&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("article_id");
        });
    });
  });

  describe("GET query - limit", () => {
    test("limit 200: responds with an array of article objects of a specified amount (limit)", () => {
      return request(app)
        .get("/api/articles?limit=5")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(5);
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
          });
        });
    });
    test("limit 200: responds with an array of 10 articles when no limit specified", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(10);
        });
    });
    test("limit 200: responds with all the articles if the quantity is below the limit", () => {
      return request(app)
        .get("/api/articles?limit=20")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(13);
        });
    });
    test("limit 400: responds with a bad request if the limit is the wrong data type", () => {
      return request(app)
        .get("/api/articles?limit=five")
        .then(({ body }) => {
          expect(body.message).toBe("bad request");
        });
    });
    test("limit 400: responds with a bad request if the limit is outside the range of 3 - 25", () => {
      return request(app)
        .get("/api/articles?limit=30")
        .then(({ body }) => {
          expect(body.message).toBe("bad request");
        });
    });
  });

  describe("GET query - page", () => {
    test("page 200: responds with the array of article objects on the first page when page number is specified", () => {
      return request(app)
        .get("/api/articles?page=1")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(10);
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
          });
        });
    });
    test("page 200: responds with the array of article objects of the correct limit on the first page when page number is NOT specified", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(10);
        });
    });
    test("page 200: responds with the array of article objects on the second page when page number is specified", () => {
      return request(app)
        .get("/api/articles?page=2")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).toBe(3);
        });
    });
    test("page 400: responds with a bad request message when a page number is the wrong data type", () => {
      return request(app)
        .get("/api/articles?page=two")
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("bad request");
        });
    });
    test("page 404: responds with a not found if the page number specified contains no articles", () => {
      return request(app)
        .get("/api/articles?page=3")
        .expect(404)
        .then(({ body }) => {
          expect(body.message).toBe("not found");
        });
    });
  });

  //remove uncessary checks of object properties^^^^^^

  describe("POST", () => {
    test("POST 201: responds with the complete article object that has been sent in the request with the addition of comment_count property", () => {
      return request(app)
        .post("/api/articles")
        .send({
          author: "butter_bridge",
          title: "florida man charged with assault after throwing alligator into a wendy's",
          body: "no seriously thats an actual real headline",
          topic: "paper",
          article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        })
        .expect(201)
        .then(({ body }) => {
          expect(body.article).toMatchObject({
            article_id: 14,
            title: "florida man charged with assault after throwing alligator into a wendy's",
            topic: "paper",
            author: "butter_bridge",
            body: "no seriously thats an actual real headline",
            votes: 0,
            created_at: expect.any(String),
            article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            comment_count: 0,
          });
        });
    });
    test("POST 201: when an article object is requested with no image url it responds with the default img url", () => {
      return request(app)
        .post("/api/articles")
        .send({
          author: "butter_bridge",
          title: "florida man charged with assault after throwing alligator into a wendy's",
          body: "no seriously thats an actual real headline",
          topic: "paper",
        })
        .expect(201)
        .then(({ body }) => {
          expect(body.article).toMatchObject({
            article_id: 14,
            title: "florida man charged with assault after throwing alligator into a wendy's",
            topic: "paper",
            author: "butter_bridge",
            body: "no seriously thats an actual real headline",
            votes: 0,
            created_at: expect.any(String),
            article_img_url: "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
            comment_count: 0,
          });
        });
    });
    test("POST 201: the response ignores extra information sent in the request which is not required", () => {
      return request(app)
        .post("/api/articles")
        .send({
          author: "butter_bridge",
          title: "florida man charged with assault after throwing alligator into a wendy's",
          body: "no seriously thats an actual real headline",
          topic: "paper",
          article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        })
        .expect(201)
        .then(({ body }) => {
          expect(body.article).toMatchObject({
            article_id: 14,
            title: "florida man charged with assault after throwing alligator into a wendy's",
            topic: "paper",
            author: "butter_bridge",
            body: "no seriously thats an actual real headline",
            votes: expect.any(Number),
            created_at: expect.any(String),
            article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            comment_count: expect.any(Number),
          });
          expect(body.article.hasOwnProperty("will")).toBe(false);
        });
    });
    test("POST 400: responds with a bad request message when trying to send a request without information that is required", () => {
      return request(app)
        .post("/api/articles")
        .send({
          author: "butter_bridge",
          title: "florida man charged with assault after throwing alligator into a wendy's",
          body: "no seriously thats an actual real headline",
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("bad request");
        });
    });
    test("POST 404: responds with a not found message when trying to send a request with a topic that does not exist", () => {
      return request(app)
        .post("/api/articles")
        .send({
          author: "butter_bridge",
          topic: "breaking-news",
          title: "florida man charged with assault after throwing alligator into a wendy's",
          body: "no seriously thats an actual real headline",
          article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        })
        .expect(404)
        .then(({ body }) => {
          expect(body.message).toBe("not found");
        });
    });
    test("POST 404: responds with a not found message when trying to send a request with an author that does not exist", () => {
      return request(app)
        .post("/api/articles")
        .send({
          author: "will",
          topic: "paper",
          title: "florida man charged with assault after throwing alligator into a wendy's",
          body: "no seriously thats an actual real headline",
          article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        })
        .expect(404)
        .then(({ body }) => {
          expect(body.message).toBe("not found");
        });
    });
  });
});

describe("/api/articles/:article_id/comments)", () => {
  describe("GET", () => {
    test("GET 200: responds with an array of comments objects from a particular article to the client which be default is limited to 10 comments", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments.length).toBe(10);
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
  describe("GET query - limit", () => {
    test("limit 200: responds with an array of objects of the specified query limit size", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=5")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments.length).toBe(5);
          body.comments.forEach((comment) => {
            expect(comment).toMatchObject({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              article_id: expect.any(Number),
            });
          });
        });
    });
    test("limit 200: responds with an empty array of no comments are found with the query", () => {
      return request(app)
        .get("/api/articles/8/comments?limit=5")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments).toEqual([]);
        });
    });
    test("limit 400: responds with a bad request message if the limit is the wrong datatype", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=ten")
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("bad request");
        });
    });
    test("limit 400: responds with a bad request message if the limit is outside of the range 3-25", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=26")
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("bad request");
        });
    });
  });
  describe("GET query - page", () => {
    test("page 200: returns the first page of the results when the page number is not specified", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments.length).toBe(10);
          body.comments.forEach((comment) => {
            expect(comment).toMatchObject({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              article_id: expect.any(Number),
            });
          });
        });
    });
    test("page 200: returns the first page of the results when the page number is specified", () => {
      return request(app)
        .get("/api/articles/1/comments?page=1")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments.length).toBe(10);
          body.comments.forEach((comment) => {
            expect(comment).toMatchObject({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              article_id: expect.any(Number),
            });
          });
        });
    });
    test("page 200: returns the next page of the results when the page number is increased", () => {
      return request(app)
        .get("/api/articles/1/comments?page=2")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments.length).toBe(1);
          body.comments.forEach((comment) => {
            expect(comment).toMatchObject({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              article_id: expect.any(Number),
            });
          });
        });
    });
    test("page 400: returns a bad request message when the page number is given as the wrong datatype", () => {
      return request(app)
        .get("/api/articles/1/comments?page=one")
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("bad request");
        });
    });
  });

  describe("GET query - limit & page", () => {
    test(" query & topic 200: returns array of comment objects when queried with both limit and page", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=5&page=2")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments.length).toBe(5);
          body.comments.forEach((comment) => {
            expect(comment).toMatchObject({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              article_id: expect.any(Number),
            });
          });
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
  describe("PATCH", () => {
    test("PATCH 200: responds with the updated comment object including the the incremented new votes if a positive vote value given", () => {
      return request(app)
        .patch("/api/comments/2")
        .send({ inc_votes: 1 })
        .then(({ body }) => {
          expect(body.updatedComment).toMatchObject({
            comment_id: 2,
            article_id: 1,
            votes: 15,
            created_at: expect.any(String),
            author: "butter_bridge",
            body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
          });
        });
    });
    test("PATCH 200: responds with the updated comment object including the the descremented new votes if a negative vote value given", () => {
      return request(app)
        .patch("/api/comments/2")
        .send({ inc_votes: -1 })
        .then(({ body }) => {
          expect(body.updatedComment).toMatchObject({
            comment_id: 2,
            article_id: 1,
            votes: 13,
            created_at: expect.any(String),
            author: "butter_bridge",
            body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
          });
        });
    });
    test("PATCH 200: ignores unnecessary properties added to the request and responds with the updated object", () => {
      return request(app)
        .patch("/api/comments/2")
        .send({ inc_votes: 1, name: "will" })
        .expect(200)
        .then(({ body }) => {
          expect(body.updatedComment).toMatchObject({
            comment_id: 2,
            article_id: 1,
            votes: 15,
            created_at: expect.any(String),
            author: "butter_bridge",
            body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
          });
        });
    });
    test("PATCH 400: responds with bad request when send a request with an invalid data type for a value", () => {
      return request(app)
        .patch("/api/comments/2")
        .send({ inc_votes: "one" })
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("bad request");
        });
    });
    test("PATCH 400: responds with a bad request if send an empty object request", () => {
      return request(app)
        .patch("/api/comments/2")
        .send({})
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("bad request");
        });
    });
    test("PATCH 400: responds with a bad request if comment id is an invalid data type", () => {
      return request(app)
        .patch("/api/comments/two")
        .send({})
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("bad request");
        });
    });
    test("PATCH 400: responds with a bad request if inc_votes is not included in the sent body", () => {
      return request(app)
        .patch("/api/comments/two")
        .send({ name: "will" })
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("bad request");
        });
    });
    test("PATCH 404: responds with a not found if the comment id is the correct data type but the comment id does not yet exist in the db", () => {
      return request(app)
        .patch("/api/comments/999")
        .send({ inc_votes: 1 })
        .expect(404)
        .then(({ body }) => {
          expect(body.message).toBe("not found");
        });
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

describe("/api/users/:username testing", () => {
  describe("GET", () => {
    test("GET 200: responds with a user object containing properties about the user", () => {
      return request(app)
        .get("/api/users/rogersop")
        .expect(200)
        .then(({ body }) => {
          expect(body.user).toMatchObject({
            username: "rogersop",
            name: "paul",
            avatar_url: "https://avatars2.githubusercontent.com/u/24394918?s=400&v=4",
          });
        });
    });
    test("GET 404: responds with a not found message if user is not in the db", () => {
      return request(app)
        .get("/api/users/willfoss")
        .expect(404)
        .then(({ body }) => {
          expect(body.message).toBe("not found");
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
