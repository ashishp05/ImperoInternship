const nodemailer = require("nodemailer");
const dotenv = require("dotenv").config();

const mailsender = async (email, subject, body) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.HOST,

      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
      secure: false,
    });

    let mailInfo =await transporter.sendMail({
        from :`E-Library  | <${process.env.USER}>`,
        to :`${email}`,
        subject : `${subject}`,
        html : `${body}`
    })
    console.log("mail Info" , mailInfo.response)
    return mailInfo
  } catch (error) {
    console.log("error", error);
  }
};

module.exports = mailsender
