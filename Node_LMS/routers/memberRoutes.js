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
      .withMessage("Name is invalid please check instruction"),
    check("email")
      .isEmail()
      .withMessage("email is invalid please enter properly"),
    
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
      .withMessage("Name is invalid please check instruction"),
    check("email")
      .isEmail()
      .withMessage("email is invalid please enter properly")
      .normalizeEmail(),
  ],
  member.postEditMember
);

module.exports = router;
