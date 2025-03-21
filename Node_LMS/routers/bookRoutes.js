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
      .withMessage("Title Has minimum 3 length required."),
    body("author")
      .isString()
      .trim()
      .isLength({ min: 3 })
      .withMessage("Author Has minimum 3 length required.."),
    body("quantity")
      .isNumeric()
      .withMessage("Quantity is invalid."),
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
      .withMessage("Title Has minimum 3 length required."),
    body("author")
      .trim()
      .isString()
      .isLength({ min: 3, max: 50 })
      .withMessage("Author Has minimum 3 length required.."),
    body("quantity")
      .isNumeric()
      .withMessage("Quantity is invalid."),
      body("publicationDate").isDate().withMessage("Publiation Date is invalid."),
      body("status").isString().trim().withMessage("please enter valid status."),
   
  ],
  book.postEditBook
);

router.post("/filter-book" , book.bookFilter)
router.post("/filter-bookbypubdate" ,book.searchByPublictionDate)
router.post("/filter-bookbyquantity" ,book.filterByQuantity)
router.post("/filter-bookbyavailable" ,book.filterByAvailable)
router.post("/filter-bookbyborrowed" ,book.filterByBorrowed)
router.post("/filter-bookbymaintenance" ,book.filterByMaintenance)



module.exports = router;
