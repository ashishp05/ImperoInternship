const jwt = require("jsonwebtoken")
const Member = require("../models/memberModel");
const {    default: mongoose } = require("mongoose");
exports.isAuth = async (req, res, next) => {
  try { 
    console.log(req.headers.authorization)
    let accessToken = req.headers.authorization?.split(" ")[1];
       if(!accessToken || accessToken === '{{JWT_TOKEN_USER}}' || accessToken === '{{JWT_TOKEN_ADMIN}}')
       {
        return res.status(401).json({
          success: false ,
          message : "Unauthorized User ! Token is Missing."
        })
       }
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
     
    const user = await Member.findById(new mongoose.Types.ObjectId(decoded.id));
  
    if (!user) {
      return res.status(404).json({
        success: false ,
        message : "Unauthorized User ! Token is Missing."
      })
    }

    req.user = user || null; // Attach user to request
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({
      success : false ,
      message : 'something went wrong.',
      error : error
    })
  }
};
