const express = require("express");

const router = express.Router();
const { body } = require("express-validator");
const book = require("../controllers/bookControllers");

// ********************************************************
// **********************GET ROUTES************************
// ********************************************************

router.get("/book-details", book.getBookDetails);
router.get("/add-book", book.getAddBook);
router.get("/edit-book/:id", book.getEditBook);
router.get("/delete-book/:id", book.deleteBook);

// ********************************************************
// **********************POST ROUTES***********************
// ********************************************************

router.post(
  "/add-book",
  [
    body("title")
      .isString()
      .trim()
      .isLength({ min: 3 })
      .withMessage("Title is invalid please check instructions."),
    body("author")
      .isString()
      .trim()
      .isLength({ min: 3 })
      .withMessage("Author Name is invalid please check instructions."),
    body("quantity")
      .isNumeric()
      .withMessage("Quantity is invalid please check instructions."),
    body("publicationDate").isDate().withMessage("Publiation Date in invalid."),
    body("status").isString().trim().withMessage("please enter valid status."),
  ],
  book.postAddBook
);
router.post(
  "/edit-book",
  [
    body("title")
      .trim()
      .isString()
      .isLength({ min: 3, max: 50 })
      .withMessage("Title is invalid please check instructions."),
    body("author")
      .trim()
      .isString()
      .isLength({ min: 3, max: 50 })
      .withMessage("Author Name is invalid please check instructions."),
    body("quantity")
      .isNumeric()
      .withMessage("Quantity is invalid please check instructions."),
   
  ],
  book.postEditBook
);

module.exports = router;
