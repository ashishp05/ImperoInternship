const mongoose = require("mongoose")
const mailsender = require("../utils/mailSender")
const mailTemplate = require("../utils/mailTemplates/emailVerificationTemplate")
const otpSchema = new mongoose.Schema({
    email : {
        type : String,
        trim : true ,
        required :true
    } ,
    otp : {
        type : String ,
        required : true
    },
    createdAt : {
        type :Date ,
        default : Date.now ,
        expires : 60*5
    }
});

async function sendVerificationMail(email, otp) {
    try { 

          console.log("email " , email ,otp)
        const responseSend = await mailsender(  email ,
            "verification Email",
            mailTemplate(otp))
        
            console.log("Email Send Ho gaya !!!" , responseSend)
    } catch (error) {
        console.log(error)
        
    }
    
}

otpSchema.pre("save" ,async function (next){
	console.log("New document saved to database");
    if (this.isNew) {
        console.log(this.email , this.otp)
		await sendVerificationMail(this.email, this.otp);
	}
    next()
} )

module.exports = new mongoose.model("OTP" , otpSchema)