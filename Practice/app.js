const path = require("path");
const express = require("express");
const dotenv = require("dotenv").config();
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const flash = require("connect-flash");
const dir = require("./util/path");
const db = require("./util/database");
const bcrypt = require("bcrypt");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(flash());

// setup mongodb store
const store = new MongoStore({
  uri: process.env.DATABASE_URL,
  collection: "session",
});
store.on("error", function (error) {
  console.log(error);
});

// setup create session ************

app.use(
  session({
    secret: "this is practice app",
    saveUninitialized: false,
    resave: false,
    cookie: { httpOnly: true },
    store: store,
  })
);

// initialise paaport after session
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
//   console.log("Session Data:", req.session);
  next();})
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // console.log("Google Profile:", profile);
        // console.log("accesstoken", accessToken);
        // console.log("refreshtoken", refreshToken);
        const name = profile.displayName
        const email = profile.emails[0].value;
        let user = await User.findOne({ email });

        if (!user) {
          // password is your firstname always
          const hashPassword = await bcrypt.hash(profile.name.givenName, 12);

          user = await User.create({
            name: name,
            email: email,
            password: hashPassword,
          });
        }

        return done(null, user);
      } catch (err) {
        console.error(err);
        return done(err);
      }
    }
  )
);

// Serialize user for session persistence
passport.serializeUser((user, done) => {
  // console.log("serialized user :", user.id)
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  // console.log("DEserialized user :", id)

  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// *****set ejs and views*** and static files
app.use(express.static(path.join(dir, "public")));

app.set("view engine", "ejs");
app.set("views", "views");
// ***middleware of user attachment
const User = require("./models/userModel");
app.use(async (req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) {
      return next();
    }
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    next(err);
  }
});

//  router
const userRouter = require("./router/userRouter");
const authRouter = require("./router/authRoute");
app.use(authRouter);
app.use("/", userRouter);

//  databse connnection

db.connectDb();

app.listen(process.env.PORT, () => {
  console.log(`App is runnig on ${process.env.PORT} successfully...!`);
})
