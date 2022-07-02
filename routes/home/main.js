const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const Category = require("../../models/Category");
const User = require("../../models/User");

router.all("/*", (req, res, next) => {
  req.app.locals.layout = "home";
  next();
});

router.get("/", async (req, res) => {
  const posts = await Post.find().lean();
  const category = await Category.find().lean();
  res.render("home/index", { posts: posts, category: category });
});

router.get("/post/:id", async (req, res) => {
  const _id = req.params.id;
  //when populate multiple things
  const post = await Post.findById({ _id: _id })
    .populate({
      path: "comments",
      populate: { path: "user", model: "User" },
    })
    .lean();
  res.render("home/postDetail", { post: post });
});

router.get("/about", (req, res) => {
  res.render("home/about");
});

//login route
router.get("/login", (req, res) => {
  res.render("home/login");
});

passport.use(
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    User.findOne({ email: email }).then((user) => {
      if (!user) return done(null, false, { message: "No User Found" });
      bcrypt.compare(password, user.password, (err, matched) => {
        if (err) {
          return err;
        }
        if (matched) {
          return done(null, user);
        } else {
          return done(null, false, { message: "incorrect Password" });
        }
      });
    });
  })
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

//Login route
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/admin",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
});

//register route
router.get("/register", (req, res) => {
  res.render("home/register");
});

//register new Account
router.post("/register", (req, res) => {
  const newUser = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
  });

  let errors = [];

  if (!req.body.firstName) {
    errors.push({ message: "Firstname field cannot be empty" });
  }

  if (!req.body.lastName) {
    errors.push({ message: "Lastname field cannot be empty" });
  }
  if (!req.body.email) {
    errors.push({ message: "Email field cannot be empty" });
  }

  if (!req.body.password) {
    errors.push({ message: "Password field cannot be empty" });
  }

  if (req.body.password !== req.body.passwordConfirm) {
    errors.push({ message: "Password and Confirm Password should be same" });
  }

  if (errors.length > 0) {
    res.render("home/register", {
      errors: errors,
    });
  } else {
    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
    });

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        newUser.password = hash;
        newUser.save().then((savedUser) => {
          req.flash(
            "success_message",
            "Your Account was created successfully You can Login Now"
          );
          res.redirect("/login");
        });
      });
    });
  }
});

//logout functionality
router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session.destroy(null);
    res.redirect("/login");
  });
});
module.exports = router;
