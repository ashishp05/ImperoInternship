const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    image : {
        type : String
    },
    gender : {
        type : String,
        enum : ["male" , "female" , "other"]
    },
    dateOfBirth : {
        type : Date,
    },
    contactNumber : {
        type : Number,
        trim : true
    },
    collageName : {
        type :String,
        trim : true
    },
    department :{
        type :String,
        trim : true
    }
} , {timestamps : true})

module.exports = new mongoose.model("Profile" , profileSchema)