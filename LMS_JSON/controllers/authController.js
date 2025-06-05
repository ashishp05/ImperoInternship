const Member = require("../models/memberModel");
const OTP = require("../models/otpModel");
const bcrypt = require("bcrypt");
const Profile = require("../models/profileModel");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { error } = require("toastr");
const { validationResult } = require("express-validator");
const mailsender = require("../utils/mailSender");
const mailTemplate = require("../utils/mailTemplates/resetPasswordEmail");
exports.sendOtp = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Error occured in Validation",
        error: errors.array()[0],
      });
    }
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(404).json({
        success: false,
        message: "Required All Fields.",
      });
    }
    if (password !== confirmPassword) {
      return res.status(404).json({
        success: false,
        message: "Password and confirmPassword is not matched.",
      });
    }
    const isPresent = await Member.findOne({ email: email });
    if (isPresent) {
      return res.status(406).json({
        success: false,
        message: "User is Already Present, Please Login.",
      });
    }

    let otp = Math.floor(100000 + Math.random() * 900000);
    console.log("otp", otp);
    const result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = Math.floor(100000 + Math.random() * 900000);
    }

    await OTP.deleteMany({ email });

    const newOtp = new OTP({ email, otp });
    await newOtp.save();
    console.log("otp body", newOtp);

    return res.status(200).json({
      success: true,
      message: "OTP send Successfully",
      otp: otp,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something Went Wrong..",
      error: error,
    });
  }
};

exports.signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Error occured in Validation",
        error: errors.array()[0],
      });
    }
    let signupData = req.body.signupData;

    const otp = req.body.otp;
    if (
      !signupData.name ||
      !signupData.email ||
      !signupData.password ||
      !signupData.confirmPassword ||
      !otp
    ) {
      return res.status(404).json({
        success: false,
        message: "Required All Fields.",
      });
    }

    const existingMember = await Member.findOne({ email: signupData.email });
    if (existingMember) {
      return res.status(406).json({
        success: false,
        message: "User is Already Present, Please Login.",
      });
    }
    console.log("signupdata", signupData);
    const currOtp = await OTP.find({ email: signupData.email });

    if (currOtp.length <= 0) {
      return res.status(404).json({
        success: false,
        message: "OTP is not valid.",
      });
    }
    if (otp != currOtp[0].otp) {
      return res.status(404).json({
        success: false,
        message: "OTP is not valid.",
      });
    }

    const hashpassword = await bcrypt.hash(signupData.password, 12);
    const profile = await Profile.create({
      image: null,
      gender: null,
      dateOfBirth: null,
      contactNumber: null,
      collageName: null,
      department: null,
    });
    const user = await Member.create({
      name: signupData.name,
      email: signupData.email,
      password: hashpassword,
      profile: profile,
      membershipStatus: "active",
      memberType: "admin",
    });
    console.log("user signin successfully");
    return res.status(200).json({
      success: true,
      message: "User signedup Successfully",
      user: user._id,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something Went Wrong..",
      error: error,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Error occured in Validation",
        error: errors.array()[0],
      });
    }
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(404).json({
        success: false,
        message: "Required All Fields.",
      });
    }
    const isMember = await Member.findOne({ email });

    if (!isMember) {
      return res.status(404).json({
        success: false,
        message: "User is Not Found, please Signup.",
      });
    }

    if (isMember.membershipStatus == "inactive") {
      return res.status(203).json({
        success: false,
        message: "User is inactive , cannot get login.",
      });
    }
    const matchPassword = await bcrypt.compare(password, isMember.password);

    if (!matchPassword) {
      return res.status(404).json({
        success: false,
        message: "Password is not matched. please try again.",
      });
    }
    const accessToken = await jwt.sign(
      {
        email: isMember.email,
        id: isMember._id,
        memberType: isMember.memberType,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    if (!accessToken) {
      return res.status(404).json({
        success: false,
        message: "Token is invalid.",
      });
    }

    console.log("Login successfully.");
    const loggedInUser = await Member.findOne(
      { email: email },
      "name uId email memberType membershipStatus"
    );
    return res.status(200).json({
      success: true,
      message: "User LoggedIn successfully.",
      token: accessToken,
      user: loggedInUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something Went Wrong..",
      error: error,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("connect.sid"); 
    return res.status(200).json({
      success: true,
      message: "User Logged Out Successfully.",
      user: req.user,
    });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({
      success: false,
      message: "Cannot logout, please try again.",
      error: error,
    });
  }
};


exports.getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthenticated User!!",
      });
    }
    const user = await Member.findById(req.user._id)
      .select("-password -prefferdCategories -membershipStatus -resetPasswordToken")
      .populate("profile");

    return res.status(200).json({
      success: true,
      message: "Profile fatched  Successfully.",
      user: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something Went Wrong..",
      error: error,
    });
  }
};

exports.editProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Error occured in Validation",
        error: errors.array()[0],
      });
    }
    const {
      fullName,
      gender,
      dateOfBirth,
      contactNumber,
      collageName,
      department,
    } = req.body;
    const user = await Member.findById(req.user._id);
    if (
      !fullName ||
      !gender ||
      !dateOfBirth ||
      !contactNumber ||
      !collageName ||
      !department
    ) {
      return res.status(404).json({
        success: false,
        message: "Required All Fields",
      });
    }

    const pid = user.profile;
    const profile = await Profile.findByIdAndUpdate(
      pid,
      { $set: { gender, dateOfBirth, contactNumber, collageName, department } },
      { new: true }
    );

    const member = await Member.findByIdAndUpdate(
      req.user._id,
      { $set: { name: fullName } },
      { new: true }
    ).populate("profile");
    return res.status(200).json({
      success: true,
      message: "Profile Updated Successfully.",
      user: {
        name: member.name,
        profile,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something Went Wrong..",
      error: error,
    });
  }
};

exports.geteditProfileImage = async (req, res) => {
  try {
    const image = req.file;
    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image is Not FOund",
      });
    }

    const user = await Member.findByIdAndUpdate(req.user._id);
    const pid = user.profile;
    const imageUrl = `/images/${req.file.filename}`;

    const profile = await Profile.findByIdAndUpdate(
      pid,
      { $set: { image: imageUrl } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Profile Image Updated Successfully.",
      profile: profile,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something Went Wrong..",
      error: error,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Error occured in Validation",
        error: errors.array()[0],
      });
    }

    const isUserPresent = await Member.findOne({ email: email });

    if (!isUserPresent) {
      return res.status(404).json({
        success: false,
        message: "User is Not Registered, please Signup.",
      });
    }

    const resetPasswordToken = crypto.randomBytes(32).toString("hex");
    console.log("resetPasswordToken", resetPasswordToken);
    async function sendResetPasswordMail(email, resetPasswordToken) {
      try {
        const responseSend = await mailsender(
          email,
          "Reset Password Email",
          mailTemplate(email, resetPasswordToken)
        );
        console.log("Email sent successfully!", responseSend);
      } catch (error) {
        console.error("Error sending email:", error);
      }
    }

    await sendResetPasswordMail(email, resetPasswordToken);
    const user = await Member.findOneAndUpdate(
      { email: email },
      { $set: { resetPasswordToken: resetPasswordToken } },
      { new: true }
    );

    return res.status(201).json({
      success: true,
      message: "Password Reset token sent Successfully",
      token: resetPasswordToken,
      user: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something Went Wrong..",
      error: error,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Error occured in Validation",
        error: errors.array()[0],
      });
    }
    const { password, confirmPassword } = req.body;
    const resetPasswordToken = req.headers.authorization?.split(" ")[1];

    if (!password || !confirmPassword) {
      return res.status(404).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (password != confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirmPassword is not matched",
      });
    }

    console.log(resetPasswordToken);

    const user = await Member.findOne({
      resetPasswordToken: resetPasswordToken,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "user is not found",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    const updateUserPassword = await Member.findOneAndUpdate(
      { resetPasswordToken: resetPasswordToken },
      { $set: { password: hashedPassword, resetPasswordToken: null } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something Went Wrong..",
      error: error,
    });
  }
};

exports.resetPasseordPofile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Error occured in Validation",
        error: errors.array()[0],
      });
    }

    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(404).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (password != confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirmPassword is not matched",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await Member.findByIdAndUpdate(
      req.user._id,
      { $set: { password: hashedPassword } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something Went Wrong..",
      error: error,
    });
  }
};
