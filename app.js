const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const path = require("path");
var hbs = require("express-handlebars");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const uplaod = require("express-fileupload");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
require("dotenv").config({ path: "./config/.env" });

//mongo db connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("mongodb connected created");
});

app.use(express.static(path.join(__dirname, "public")));

const { select } = require("./helper/handlebars-select-helper");
app.set("view engine", "handlebars");
app.engine(
  "handlebars",
  hbs.engine({
    extname: "handlebars",
    defaultLayout: "home",
    helpers: { select: select },
  })
);

//upload middleware

app.use(uplaod());

app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());
app.use(methodOverride("_method"));
//use the session
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
  })
);

//use the flash
app.use(flash());

//Passport
app.use(passport.initialize());
app.use(passport.session());

//local variables using middleware
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.success_message = req.flash("success_message");
  res.locals.error_message = req.flash("error_message");
  res.locals.err = req.flash("error");

  next();
});

//load routes
const main = require("./routes/home/main");
const admin = require("./routes/admin/index");
const post = require("./routes/admin/post");
const categories = require("./routes/admin/categories");
const comment = require("./routes/admin/comment");

//use routes
app.use("/", main);
app.use("/admin", admin);
app.use("/admin/posts", post);
app.use("/admin/categories", categories);
app.use("/admin/comment", comment);

app.listen(port, () => {
  console.log(`Express is running on: ${port}`);
});
