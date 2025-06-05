const mongoose = require("mongoose")

 const categorySchema = new mongoose.Schema({
    category : {
        type: String,
        trim : true,
        required :true
    },
    books : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Book"
    }]
 })

 module.exports = new mongoose.model("Category" , categorySchema)