const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");
const Comment = require("../../models/Comment");
const Category = require("../../models/Category");
const User = require("../../models/User");
const { userAuthenticated } = require("../../helper/authentication");
router.all("/*", userAuthenticated, (req, res, next) => {
  req.app.locals.layout = "admin";
  next();
});

router.get("/", async (req, res) => {
  //count the all comment of the user
  const commentCount = await Comment.count({}).lean();
  //count the category of all the post
  const categoryCount = await Category.count({}).lean();
  //count the list of the user
  const userCount = await User.count({}).lean();

  console.log(commentCount);
  Post.count({}).then((postCount) => {
    res.render("admin/index", {
      postCount: postCount,
      commentCount: commentCount,
      categoryCount: categoryCount,
      userCount: userCount,
    });
  });
});

module.exports = router;
