const express = require("express");

const router = express.Router();

const userController = require("../controller/userController");

router.get("/", userController.getHome);
router.get("/about", userController.getAbout);
router.get("/contact", userController.getContact);

module.exports = router;
