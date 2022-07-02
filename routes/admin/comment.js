const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");
const Comment = require("../../models/Comment");
const { userAuthenticated } = require("../../helper/authentication");
router.all("/*", userAuthenticated, (req, res, next) => {
  req.app.locals.layout = "admin";
  next();
});
router.get("/", async (req, res) => {
  const allComment = await Comment.find().populate("user").lean();
  res.render("admin/comments", { allComment: allComment });
});
//store the comments
router.post("/", (req, res) => {
  Post.findOne({ _id: req.body.post_id }).then((post) => {
    const newComment = new Comment({
      user: req.user._id,
      body: req.body.body,
    });
    post.comments.push(newComment);
    post.save().then((savedPost) => {
      newComment.save().then((savedComments) => {
        res.redirect(`/post/${post._id}`);
      });
    });
  });
});

//delete the comments
router.delete("/:id", (req, res) => {
  Comment.findByIdAndRemove({ _id: req.params.id }).then((deleteComment) => {
    Post.findOneAndUpdate(
      { comments: req.params.id },
      { $pull: { comments: req.params.id } },
      (err, data) => {
        if (err) console.log(err);
        req.flash("success_message", "Comment has been deleted Successfully");
        res.redirect("/admin/comment");
      }
    );
  });
});
module.exports = router;
