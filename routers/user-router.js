userRouter = require("express").Router();

const { getUsers, getUserByUsername, deleteUserByUsername } = require("../controllers/user-controller");

userRouter.route("/").get(getUsers);
userRouter.route("/:username").get(getUserByUsername);
userRouter.route("/:username").delete(deleteUserByUsername);

module.exports = userRouter;
