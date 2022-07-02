const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");
const Category = require("../../models/Category");

const { userAuthenticated } = require("../../helper/authentication");
router.all("/*", userAuthenticated, (req, res, next) => {
  req.app.locals.layout = "admin";
  next();
});

//show the list of the all post
router.get("/", async (req, res) => {
  //learn():- is used to work with handlebars if we use the handlebars template for frontend then we need to use that
  const posts = await Post.find({}).populate("category").lean();
  res.render("admin/post/index", {
    posts: posts,
    success_message: req.flash("success_message"),
  });
});

//show the create post form
router.get("/create", async (req, res) => {
  const allCategory = await Category.find().lean();
  res.render("admin/post/create", { allCategory: allCategory });
});

//create the new post
router.post("/create", async (req, res) => {
  let errors = [];

  if (!req.body.title) {
    errors.push({ message: "Please enter a title" });
  }

  if (!req.body.body) {
    errors.push({ message: "Please enter a description" });
  }

  if (errors.length > 0) {
    res.render("admin/post/create", { errors: errors });
  } else {
    //allowComments should be either true or false
    let filename = "";

    let file = req.files.image;
    filename = file.name;
    file.mv("./public/uploads/" + filename, (err) => {
      if (err) throw err;
    });
    let allowComments = true;
    if (req.body.allowComments) {
      allowComments = true;
    } else {
      allowComments = false;
    }

    const newPost = new Post({
      user: req.user._id,
      title: req.body.title,
      image: filename,
      category: req.body.category,
      status: req.body.status,
      allowComments: allowComments,
      body: req.body.body,
    });
    await newPost.save();
    req.flash(
      "success_message",
      `Post ${req.body.title} was created successfully`
    );
    res.redirect("/admin/posts/my-posts");
  }
});

//edit the post route
router.get("/edit/:id", async (req, res) => {
  const postId = req.params.id;
  const allCategory = await Category.find().lean();
  const editPost = await Post.findById({ _id: postId }).lean();
  res.render("admin/post/edit", {
    editPost: editPost,
    allCategory: allCategory,
  });
});

//update the post
router.put("/edit/:id", async (req, res) => {
  const _id = req.params.id;
  let allowComments = true;
  if (req.body.allowComments) {
    allowComments = true;
  } else {
    allowComments = false;
  }
  try {
    await Post.findByIdAndUpdate(_id, {
      user: req.user._id,
      title: req.body.title,
      category: req.body.category,
      status: req.body.status,
      allowComments: allowComments,
      body: req.body.body,
    });
    req.flash("success_message", "Post has been Updated Successfully");
    res.redirect("/admin/posts/my-posts");
  } catch (error) {
    res.status(500).json({ error: "There was a Server Side Error!" });
  }
});

//Delete the post
router.delete("/:id", (req, res) => {
  const postId = req.params.id;
  Post.findOne({ _id: postId })
    .populate("comments")
    .then((post) => {
      if (post.comments.length > 0) {
        post.comments.forEach((comment) => {
          comment.remove();
        });
      }
      post.remove().then((deletePost) => {
        req.flash("success_message", "Post has been deleted Successfully");
        res.redirect("/admin/posts/my-posts");
      });
    });
});

//user specific post
router.get("/my-posts", (req, res) => {
  Post.find({ user: req.user._id })
    .populate("category")
    .lean()
    .then((posts) => {
      res.render("admin/post/my-posts", { posts: posts });
    });
});

module.exports = router;
