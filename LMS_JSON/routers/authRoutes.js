    const express = require("express");

    const router = express.Router();
    const { body, check } = require("express-validator");
    const auth = require("../controllers/authController");
    const { isAuth } = require("../middleware/isauth");

router.post(
  "/send-otp",
  [
    body("name")
      .isString()
      .trim()
      .isLength({ min: 3, max: 25 })
      .withMessage("Name is invalid."),
    body("email")
      .isEmail()
      .isString()
      .trim()
      .isLength({ max: 50 })
      .withMessage("Email is invalid."),
    body("password")
      .isString()
      .trim()
      .isLength({ min: 3, max: 25 })
      .withMessage("Password is invalid."),
    body("confirmPassword")
      .isString()
      .trim()
      .isLength({ min: 3, max: 25 })
      .withMessage("Confirm password is invalid."),
  ],
  auth.sendOtp
);
router.post(
  "/signup",
  [
    body("signupData").isObject().withMessage("SignupData is invalid Value"),
    body("otp")
      .isNumeric()
      .isLength({ min: 6, max: 6 })
      .withMessage("Otp is Invalid"),
  ],
  auth.signup
);
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .isString()
      .trim()
      .isLength({ max: 50 })
      .withMessage("Email is invalid."),
    body("password")
      .isString()
      .trim()
      .isLength({ min: 3, max: 25 })
      .withMessage("Password is invalid."),
  ],
  auth.login
);


router.delete("/logout", auth.logout);
router.get("/my-profile", isAuth, auth.getProfile);

router.patch(
  "/edit-profile",
  [
    body("fullName")
      .isString()
      .trim()
      .isLength({ min: 3, max: 25 })
      .withMessage("Name is invalid."),
    check("gender").custom((value) => {
      if (value === "male" || value === "female" || value === "other") {
        return true;
      }
      throw new Error(
        "Invalid gender value. Allowed values: 'male', 'female', 'other'."
      );
    }),
    body("contactNumber")
      .isNumeric()
      .trim()
      .isLength({ min: 10, max: 10 })
      .withMessage("Mobile number contains exact 10 digits")
      .isMobilePhone()
      .withMessage("Invalid contact number value"),
    body("dateOfBirth")
      .notEmpty()
      .isISO8601()
      .withMessage("Birthdate must be a valid date (YYYY-MM-DD)")
      .isBefore(new Date().toISOString().split("T")[0])
      .withMessage("Birthdate must be in the past")
      .custom((value) => {
        const birthDate = new Date(value);
        const ageDifMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDifMs);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);

        if (age < 13) {
          throw new Error("You must be at least 13 years old");
        }
        return true;
      }),
    body("department")
      .isString()
      .trim()
      .isLength({ min: 2, max: 25 })
      .withMessage("department Name is invalid."),
    body("collageName")
      .isString()
      .trim()
      .isLength({ min: 3, max: 25 })
      .withMessage("Collage Name is invalid."),
  ],
  isAuth,
  auth.editProfile
);
router.patch("/edit-profile-image", isAuth, auth.geteditProfileImage);

router.post(
  "/reset-password",
  [
    body("password")
      .isString()
      .trim()
      .isLength({ min: 3, max: 25 })
      .withMessage("Password is invalid."),
    body("confirmPassword")
      .isString()
      .trim()
      .isLength({ min: 3, max: 25 })
      .withMessage("Confirm password is invalid."),
  ],
  auth.resetPassword
);
router.post(
  "/my-profile/reset-password",
  [
    body("password")
      .isString()
      .trim()
      .isLength({ min: 3, max: 25 })
      .withMessage("Password is invalid."),
    body("confirmPassword")
      .isString()
      .trim()
      .isLength({ min: 3, max: 25 })
      .withMessage("Confirm password is invalid."),
  ],
  isAuth,
  auth.resetPasseordPofile
);

router.post(
  "/forgot-password",
  body("email")
    .isEmail()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Email is invalid."),
  auth.forgotPassword
);


module.exports = router;

