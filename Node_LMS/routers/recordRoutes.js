const express = require("express");

const router = express.Router();

const record = require("../controllers/recordControllers");
const { body, check } = require("express-validator");

// ********************************************************
// **********************GET ROUTES************************
// ********************************************************

router.get("/record-details", record.getRecordDetails);
router.get("/add-record", record.getAddRecord);
router.get("/edit-record/:rid/:bid", record.getEditRecord);
router.get("/delete-record/:id/:bookid", record.deleteRecord);

// ********************************************************
// **********************POST ROUTES***********************
// ********************************************************

router.post(
  "/add-record",
  [
    body("memberId")
      .isAlphanumeric()
      .withMessage("please enter valid member refrence."),
    body("bookId")
      .isAlphanumeric()
      .withMessage("please enter valid book refrence."),
    check("issueDate").isDate().withMessage("Please enter valid issue Date."),
    check("dueDate").isDate().withMessage("Please enter valid due Date."),
    body("status").isString().withMessage("please enter valid status"),
  ],
  record.addRecord
);
router.post(
  "/edit-record",
  [
    body("memberId")
      .isAlphanumeric()
      .withMessage("please enter valid member refrence."),
    body("bookId")
      .isAlphanumeric()
      .withMessage("please enter valid book refrence."),
    check("issueDate").isDate().withMessage("Please enter valid issue Date."),
    check("dueDate").isDate().withMessage("Please enter valid due Date."),
    body("status").isString().withMessage("please enter valid status"),
  ],
  record.postEditRecord
);

module.exports = router;
