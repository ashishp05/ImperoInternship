const express = require("express");

const router = express.Router();

const { body, check } = require("express-validator");

const member = require("../controllers/memberControllers");

// ********************************************************
// **********************GET ROUTES************************
// ********************************************************

router.get("/member-details", member.getMemberDetails);
router.get("/add-member", member.getAddMember);
router.get("/edit-member/:id", member.geteditMember);

//****delete-memeber using link not a form***************

router.get("/delete-member/:id", member.deleteMember);

// ********************************************************
// **********************POST ROUTES***********************
// ********************************************************

router.post(
  "/add-member",
  [
    body("name")
      .trim()
      .isString()
      .isLength({ min: 3, max: 50 })
      .withMessage("Name has minimum 3 length."),
    check("email")
      .isEmail()
      .withMessage("email has minmum 3 length."),
    
  ],
  member.addMemeber
);
router.post(
  "/edit-member",
  [
    body("name")
      .trim()
      .isString()
      .isLength({ min: 3, max: 50 })
      .withMessage("Name is invalid "),
    check("email")
      .isEmail()
      .withMessage("email is invalid ")
    
  ],
  member.postEditMember
);

router.post("/filter-member" , member.filterMember)

module.exports = router;
