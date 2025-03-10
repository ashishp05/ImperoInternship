const express = require("express");
const app = express();
const db = require("./config/database");
const dotenv = require("dotenv").config();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const path = require("path");
const Book = require("./models/bookModel");
const Member = require("./models/memberModel");
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT;

app.set("view engine", "ejs");
app.set("views", "views");

// **********************ADD ROUTES********************************
const bookRoutes = require("./routers/bookRoutes");
const memberRoutes = require("./routers/memberRoutes");
const recordRoutes = require("./routers/recordRoutes");

app.use("/book", bookRoutes);
app.use("/member", memberRoutes);
app.use("/record", recordRoutes);

db.connectDb();

app.use((error, req, res, next) => {
  console.error(error);

  res.status(error.httpStatusCode || 500).render("500", {
    title: "Internal Server Error",
    error: "Something went wrong. Please try again later.",
    edit: false,
  });
});

app.get("/", async (req, res) => {
  res.render("home", {
    title: "Home page",
    error: null,
    member: await Member.find().sort({membershipStatus : 1}).sort({ name: 1 }),
    book: await Book.find().sort({status : 1}).sort({ title: 1 }),
  });
});

app.use((req ,res ,next) =>
  {

  res.render('404', {title : 'Error Page'})
  })
app.listen(PORT, () => {
  console.log(`App is successfully Running on ${PORT} PORT`);
});
