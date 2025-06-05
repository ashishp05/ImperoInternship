const express = require("express");
const app = express();
const db = require("./config/database");
const cronjob = require("./config/cronjob");
const dotenv = require("dotenv").config();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const path = require("path");
const Book = require("./models/bookModel");
const Member = require("./models/memberModel");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json())
const session = require("express-session");
const multer = require("multer");
const {isAuth}= require("./middleware/isauth")

const MongoDBsession = require("connect-mongodb-session")(session);



const store = new MongoDBsession({
    uri: process.env.DATABASE_URL,
    collection: "session",
  });

app.use("/images", express.static(path.join(__dirname, "images")));



  const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'images');
    },
    filename: (req, file, cb) => {
      cb(null,  new Date().getTime()+"-"+file.originalname);
    },
  });
  const filefilter  = (req ,file , cb ) =>
  {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg')
    {
      cb(null , true)
    }
    else
    {
      cb(null , false)
    }
  }
   
  store.on("error", function (error) {
    console.log(error);
  });
app.use(session({
    secret: process.env.JWT_SECRET, 
    resave: false,
    saveUninitialized: false,
   
     store :store
  }));
 
 

const PORT = process.env.PORT;

app.set("view engine", "ejs");
app.set("views", "views");

app.use(multer({ storage: fileStorage ,fileFilter : filefilter   }).single("image"));

// **********************ADD ROUTES********************************
const bookRoutes = require("./routers/bookRoutes");
const memberRoutes = require("./routers/memberRoutes");
const recordRoutes = require("./routers/recordRoutes");
const homeRoutes = require("./routers/homeRoutes");
const authRoutes = require("./routers/authRoutes")
const categoryRoutes = require("./routers/categoryRoutes")
app.use("/book", bookRoutes);
app.use("/book", categoryRoutes);

app.use("/member", memberRoutes);
app.use("/record", recordRoutes);
app.use(homeRoutes);
app.use("/auth" , authRoutes)

db.connectDb();
cronjob.cronjob();
app.use((error, req, res, next) => {
  console.error(error);

  res.status(error.httpStatusCode || 500).json({
    success : false ,
    message : "Something went wrong. please check it care fully",
    error : error
  })
});

app.get("/", async (req, res) => {
 
  res.render("home", {
    title: "Home page",
    error: null,
    member: await Member.find(),
    book: await Book.find(),
    oldInput: {},
  });
  
})
;
app.use((req, res, next) => {
  res.render("404", { title: "Error Page" ,user : req.user, });
});
app.listen(PORT, () => {
  console.log(`App is successfully Running on ${PORT} PORT`);
});
