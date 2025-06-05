const jwt = require("jsonwebtoken")
const Member = require("../models/memberModel");
const {    default: mongoose } = require("mongoose");
exports.isAdmin = async (req, res, next) => {
  try {
    let accessToken =  req.headers.authorization?.split(" ")[1];
        const useri = req.user ? req.user : null
       if(!accessToken)
       {
        return res.status(404).json({
            success: false ,
            message : "Unauthorized User ! Token is Missing."
          })
       }
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
     
    const user = await Member.findById(new mongoose.Types.ObjectId(decoded.id));
 
    if (user.memberType  !="admin") {
        return res.status(400).json({
            success: false ,
            message : "This is Protected for Admins Only."
          })
    }

    req.user = user || null; // Attach user to request
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
   return res.status(500).json({
    success : false , 
    message : "Something went wrong.",
    error : error
   })
   
  }
};
