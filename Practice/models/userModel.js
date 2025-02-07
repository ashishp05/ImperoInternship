const mongoose = require("mongoose")

const userModel = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },
    email : 
    {
        type : String,
        required :true ,
        lowercase : true
    },
    password :
    {
        type : String,
        required : true
    },
    confirmPassword : 
    {
       type:String,
      
    },
    session : String,
    sessionExpires : Date
 
} ,{timestamps : true}  )


module.exports = mongoose.model("User" , userModel);