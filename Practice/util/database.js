const mongoose = require("mongoose")
const dotenv = require("dotenv").config()
 
const {DATABASE_URL }= process.env

exports.connectDb = () =>

{  mongoose.connect( DATABASE_URL) 
    .then(result =>
    {
        console.log("Database Connected Successfully!")
    }
    ).catch(err =>
    {
        console.log("Error due to connection of database.", err)
        process.exit(1)
    }
    )

}