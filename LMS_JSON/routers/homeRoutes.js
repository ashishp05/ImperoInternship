const express = require("express");

const router = express.Router();

const home = require("../controllers/homeController");
const { isAuth } = require("../middleware/isauth");
const {isAdmin} = require("../middleware/isAdmin")

router.get("/dashboard/user" , isAuth , home.getDashboardUser)
router.get("/dashboard/admin" , isAuth ,isAdmin, home.getDashboardAdmin)


module.exports = router