const express = require("express");

const router = express.Router();
const { body } = require("express-validator");
const book = require("../controllers/bookControllers");
const {isAuth} = require("../middleware/isauth")
const {isAdmin} = require("../middleware/isAdmin")

// ********************************************************
// **********************GET ROUTES************************
// ********************************************************

router.get("/book-details", isAuth , book.getBookDetails);
router.get("/preffered-book-details" , isAuth ,book.getPrefferedBookDetails)
router.delete("/delete-book/:id",isAdmin,isAuth, book.deleteBook);
router.get("/preffered-book/sort" , isAuth , book.sortPrefferedBook)
router.get("/preffered-book/filter" , isAuth , book.postAddBookrefferedBookFilter)
// ********************************************************
// **********************POST ROUTES***********************
// ********************************************************

router.post(
  "/add-book",isAuth,isAdmin,
  [
    body("title")
      .isString()
      .trim()
      .isLength({ min: 3 })
      .withMessage("Title Has minimum 3 length required."),
    body("author")
      .isString()
      .trim()
      .isLength({ min: 3 })
      .withMessage("Author Has minimum 3 length required.."),
    body("quantity").isNumeric().withMessage("Quantity is invalid."),
    body("publicationDate").isDate().withMessage("Publiation Date in invalid."),
    body("status").isString().trim().withMessage("please enter valid status."),
  ],
  book.postAddBook
);
router.patch(
  "/edit-book/:id",isAuth,isAdmin,
  [
    body("title")
      .trim()
      .isString()
      .isLength({ min: 3, max: 50 })
      .withMessage("Title Has minimum 3 length required."),
    body("author")
      .trim()
      .isString()
      .isLength({ min: 3, max: 50 })
      .withMessage("Author Has minimum 3 length required.."),
    body("quantity").isNumeric().withMessage("Quantity is invalid."),
    body("publicationDate").isDate().withMessage("Publiation Date is invalid."),
    body("status").isString().trim().withMessage("please enter valid status."),
  ],
  book.postEditBook
);

router.get("/filter-book",isAuth, book.bookFilter);
router.get("/sort",isAuth, book.sortBook);

module.exports = router;
