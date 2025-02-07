const express = require("express");
const router = express.Router();
const passport = require("passport");

const authController = require("../controller/authController");

// *************************************************************
// ********routes for login and signup manually*****************
// **************************************************************
router.get("/signup", authController.getSignUp);
router.get("/login", authController.getLogin);
router.post("/signup", authController.postSignUp);
router.post("/login", authController.postLogin);

// *************************************************************
// ********routes for login and signup using OAUTH2.0*****************
// *************************************************************

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/signup" }),
  (req, res) => {
    if (!req.user) {
      console.log("No user found after authentication");
      return res.redirect("/login");
    }

    req.session.isLoggedIn = true;
    req.session.user = req.user;

    req.session.save((err) => {
      if (err) {
        console.error(" error in session :", err);
      }
      // console.log("login user:", req.user);
      res.redirect("/");
    });
  },
  function (req, res) {
    // console.log("done*************************************")
    res.redirect("/");
  }
);

// *************************************************************
// ********routes for logout************************************
// **************************************************************
router.post("/logout", authController.postLogout);

module.exports = router;
