const express = require("express")

const router = express.Router()

const {isAuth} = require("../middleware/isauth")
const { isAdmin} = require("../middleware/isAdmin")
const category = require("../controllers/categoryController")


router.post("/add-book-category" , isAuth ,isAdmin, category.addCategory)
router.get("/category-details" , isAuth , category.getCategoryDetails)
router.patch("/edit-book-category/:id" , isAuth ,isAdmin, category.editCategory)
router.delete("/delete-book-category/:id" , isAuth,isAdmin , category.deleteCategory)
router.get("/filter-category" , isAuth , category.categoryFilter)
router.get("/category/sort",isAuth, category.sortBook);
module.exports = router