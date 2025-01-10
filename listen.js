const app = require("./app");

const { PORT = 9090 } = process.env;

//port

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}...`);
});
