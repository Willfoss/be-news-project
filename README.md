# News API

A fully tested backend project based on reddit. This project uses REST APIs to fetch data from a news website database. The endpoints give information about:

1. topics,
2. articles related to those topics,
3. comments on articles
4. users

<a href="https://be-news-project-p4dz.onrender.com/api" target="_blank">Hosted version here!</a>

---

## Project setup

clone the repo using the following links:

##### HTTP

    git clone https://github.com/Willfoss/be-news-project.git

##### SSH

    git clone git@github.com:Willfoss/be-news-project.git

Next, install the various npm packages to run the project:

    npm install

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

to run the test file, run the following command

    npm run test

---

## Version requirements

Node.js - 20.14.0 (or later)

Postgres - 14.12 (or later)
