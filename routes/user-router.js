userRouter = require("express").Router();

const { getUsers } = require("../controllers/user-controller");

userRouter.route("/").get(getUsers);

module.exports = userRouter;
