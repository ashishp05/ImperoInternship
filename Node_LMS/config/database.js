const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
exports.connectDb = () => {
  mongoose
    .connect(process.env.DATABASE_URL)
    .then((connect) => {
      console.log("Database Connected Successfully.");
    })
    .catch((err) => {
      console.log("Error While Connecting Database.", err);
      process.exit(1);
    });
};
