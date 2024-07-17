# News API

A fully tested backend project based on reddit. This project uses REST APIs to fetch data from a news website database to the client.

hosted version: TBC

---

## Project setup

clone the repo using the following links:

##### HTTP

    https://github.com/Willfoss/be-news-project.git

##### SSH

    git@github.com:Willfoss/be-news-project.git

Next, install the various npm packages to run the project:

1.          npm install
2.          npm i -D pg

---

## Database setup

in order to connect to either the development or test database it's required to create the following:

a .env.development file with the contents:

     PGDATABASE=nc_news

a .env.test file with the contents:

    PGDATABASE=nc_news_test

next setup the databases by running:

    npm run setup-dbs

then run the seed file

    npm run seed

---

## Testing

to run the test files the following are required:

Jest:

    npm i -D jest

supertest:

    npm i -D supertest

jest-sorted

    npm i -D sorted-by

to run the test file, run the following command

    npm run test

---

## Version requirements

Node.js - 20.14.0

Postgres - 14.12
