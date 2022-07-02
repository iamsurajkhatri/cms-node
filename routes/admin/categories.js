const express = require("express");
const router = express.Router();
const Category = require("../../models/Category");
const { userAuthenticated } = require("../../helper/authentication");
router.all("/*", userAuthenticated, (req, res, next) => {
  req.app.locals.layout = "admin";
  next();
});

router.get("/", async (req, res) => {
  const allCategory = await Category.find().lean();
  res.render("admin/categories/index", { allCategory: allCategory });
});

//save the new category
router.post("/create", async (req, res) => {
  let errors = [];

  if (!req.body.name) {
    errors.push({ message: "Category Field Cannot be Empty!!" });
  }
  if (errors.length > 0) {
    res.render("admin/categories/index", { errors: errors });
  } else {
    const newCategory = new Category({ name: req.body.name });
    await newCategory
      .save()
      .then((success) => {
        req.flash("success_message", "Category has been Added succesffully");
        res.redirect("/admin/categories/");
      })
      .catch((err) => {
        req.flash("error_message", `Catergory not created due to ${err}`);
        res.redirect("admin/categories");
      });
  }
});

//edit the category
router.get("/edit/:id", async (req, res) => {
  const categoryId = req.params.id;
  const editCat = await Category.findById({ _id: categoryId }).lean();
  res.render("admin/categories/edit", { editCat: editCat });
});

//Update the post
router.put("/edit/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    await Category.findByIdAndUpdate(_id, {
      name: req.body.name,
    });
    req.flash("success_message", "Category has been Updated successfully");
    res.redirect("/admin/categories");
  } catch (error) {
    res.status(500).json({ error: "There was a Server Side Error!" });
  }
});

//Delete the category
router.delete("/:id", async (req, res) => {
  const categoryId = req.params.id;
  await Category.findByIdAndRemove({ _id: categoryId });
  req.flash("success_message", "Category has been Deleted successfully");
  res.redirect("/admin/categories");
});
module.exports = router;
