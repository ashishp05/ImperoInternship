const express = require("express");

const router = express.Router();

const record = require("../controllers/recordControllers");
const { body, check } = require("express-validator");
const {isAuth} = require("../middleware/isauth")
const { isAdmin} = require("../middleware/isAdmin")
// ********************************************************
// **********************GET ROUTES************************
// ********************************************************

router.get("/record-details",isAuth,isAdmin, record.getRecordDetails);
router.delete("/delete-record/:id/:bid",isAuth,isAdmin, record.deleteRecord);

// ********************************************************
// **********************POST ROUTES***********************
// ********************************************************

router.post(
  "/add-record",isAuth,isAdmin,
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
router.patch(
  "/edit-record/:rid/:bid",isAuth,isAdmin,
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

router.get("/filter-record",isAuth,isAdmin, record.filterRecord);
router.get("/sort",isAuth, isAdmin,isAdmin, record.sortRecord);

router.get("/show-my-records" , isAuth , record.showMyRecords)
module.exports = router;
