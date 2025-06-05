const express = require("express");

const router = express.Router();

const { body, check } = require("express-validator");

const member = require("../controllers/memberControllers");
const {isAuth} = require("../middleware/isauth")
const {isAdmin} = require("../middleware/isAdmin")
// ********************************************************
// **********************GET ROUTES************************
// ********************************************************

router.get("/member-details",isAuth, member.getMemberDetails);

//****delete-memeber using link not a form***************

router.delete("/delete-member/:id",isAuth,isAdmin, member.deleteMember);

// ********************************************************
// **********************POST ROUTES***********************
// ********************************************************

router.post(
  "/add-member",isAuth, isAdmin,
  [
    body("name")
      .trim()
      .isString()
      .isLength({ min: 3, max: 50 })
      .withMessage("Name has minimum 3 length."),
    check("email").isEmail().withMessage("email has minmum 3 length."),
  ],
  member.addMemeber
);
router.patch(
  "/edit-member/:id",isAuth, isAdmin,
  [
    body("name")
      .trim()
      .isString()
      .isLength({ min: 3, max: 50 })
      .withMessage("Name is invalid "),
    check("email").isEmail().withMessage("email is invalid "),
  ],
  member.postEditMember
);
router.patch("/update-memberstatus/:userId" ,isAdmin,isAuth,member.postToggleUser)

router.get("/filter-member",isAuth, member.filterMember);
router.get("/sort",isAuth, member.sortMember);
module.exports = router;
