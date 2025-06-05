// import models
const Member = require("../models/memberModel");
const Record = require("../models/borrowRecordModel");

const { default: mongoose } = require("mongoose");
const { validationResult } = require("express-validator");
const mailTemplate = require("../utils/mailTemplates/LibrarySubscriptionEmail");
const mailsender = require("../utils/mailSender");
const Profile = require("../models/profileModel");
const bcrypt = require("bcrypt");
const { success } = require("toastr");
// Add member Page


// fatch all members
exports.getMemberDetails = async (req, res) => {
  try {
    const totalMember = await Member.countDocuments({memberType : {$in : ["student" , "faculty" , "guest"]}});
    const Member_On_Page = 6;
    const page = +req.query.page || 1;
    const totalItems = +req.query.totalItems || Member_On_Page;
    const member = await Member.find({memberType : {$in : ["student" , "faculty" , "guest"]}})
    .select("-password -accessToken -prefferdCategories")
      .skip((page - 1) * totalItems)
      .limit(totalItems)
      .sort({ createdAt: -1 });
    // return res.render("member/member-details", {
    //   title: "Member Details Page",
    //   member: member,
    //   error: null,
    //   oldInput: req.query,
    //   currentPage: page,
    //   lastPage: Math.ceil(totalMember / totalItems),
    //   sort: false,
    //   filter: false,
    //   totalItems: totalItems,
    //   user: req.user,
    // });
    return res.status(200).json({
      success : true ,
      message : "Member details Fetched successfully.",
      data : member
    })
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false ,
      message : "Something went wrong.",
      error : err
    })
  }
};

// Add member in Database
exports.addMemeber = async (req, res) => {
  try {
    const { name, email, memberType, membershipStatus ,prefferdCategories } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false ,
        message : "Error in validation",
        error : errors.array[0].msg
      })
    }

    if (!name || !email || !memberType || !membershipStatus || !prefferdCategories) {
      return res.status(404).json({
        success: false ,
        message : "All Fileds are required.",
        
      })
    }
    const existingMember = await Member.findOne({ email: email });
    if (existingMember) {
      return res.status(400).json({
        success: false ,
        message : "Member is Already exists.",
        member : existingMember
      })
    }

    const preName = memberType.slice(0, 1).toUpperCase();
    let count = 1;
    const lastMember = await Member.findOne({
      uId: new RegExp(`^${preName}`),
    }).sort({ uId: -1 });
    if (lastMember) {
      const match = lastMember.uId.match(/\d+$/);
      if (match) {
        count = parseInt(match[0]) + 1;
      }
    }
    const uid = `${preName}${count}`;

   
  
   
   
   async function generateRandomString() {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*₹';
      let result = '';
      const length = 8;
      
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
      }
      
      return result;
    }
    const password = (await generateRandomString()).toString()
    console.log(password)
    const hashpassword =await  bcrypt.hash(password , 12)
    const profile = await Profile.create({
      image: null,
      gender: null,
      dateOfBirth: null,
      contactNumber: null,
      collageName: null,
      department: null,
    });
   
    async function sendSubscriptionMail(email, password) {
      try {
        const responseSend = await mailsender(
          email,
          "Subscription Email",
          mailTemplate(email, password)
        );
        console.log("Email sent successfully!", responseSend);
      } catch (error) {
        console.error("Error sending email:", error); 
      }
    }


     await sendSubscriptionMail(email, password);
     const member = new Member({
      name ,
      uId: uid,
      email,
      memberType,
      membershipStatus,
      password : hashpassword ,
      profile : profile,
      prefferdCategories :prefferdCategories
    
    });
    const error = member.validateSync();

    if (error) {
      const errorMessages = [];

      for (const field in error.errors) {
        errorMessages.push(error.errors[field].message);
      }

      return res.status(400).json({
        success : false ,
        message : "Eeeror occure during add member",
        error : error
      })
    }
     await member.save();
     return res.status(201).json({
      success : true ,
      message : "Member Add successfully.",
      member : member
    })
  } catch (err) {
    console.log(err);
    return res.status(404).json({
      success : false ,
      message : "something went wrong.",
      error : err
    })
  }
};

exports.postToggleUser = async (req, res) => {
  try {
    const { statusToggleChange } = req.body;
    const userId = req.params.userId
    const isUser = await Member.findById(userId)
    if(!isUser)
    {
      return res.status(404).json({
        success : false ,
        message : "User not found."
      })                        
    }
    const data = await Member.findByIdAndUpdate(
      new mongoose.Types.ObjectId(userId),
      { $set: { membershipStatus: statusToggleChange } },
      { new: true }
    );

    res.json({ success: true,
      message :"Status Changed successfully.",
       data :data
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
//  Edit member in DB
exports.postEditMember = async (req, res) => {
  try {
    const { name, email, memberType ,prefferdCategories } = req.body;

    const page = +req.query.page || 1;
    const Member_On_Page = 6;
    const totalItems = +req.query.totalItems || Member_On_Page;
    const totalMember = await Member.find().countDocuments();
    const id = req.params.id;

    const isMember = await Member.findById(id)
    if(!isMember)
    { 
        return res.status(404).json({
          success: false,
          message : "Member  not Found"
        })
    }

    const allMembers = await Member.find({memberType : {$in : ["student" , "faculty" , "guest"]}})
      .skip((page - 1) * totalItems)
      .limit(totalItems).sort({ createdAt: -1 });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false ,
        message : "Error in validation",
        error : errors.array()[0]
      })
    }
    if (!name || !email || !memberType || !id || !prefferdCategories) {
      return res.status(404).json({
        success: false ,
        message : "All fileds are required.",
       
      })
    }

   
    const updatedMember = await Member.findByIdAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { name, email, memberType ,prefferdCategories }, { new :true}
    );

    const existingMember = await Member.findOne({ email: email });

    if (!existingMember) {
      return res.status(400).json({
        success: false ,
        message : "Member is already exists.",
        error : errors.array[0].msg
      })}

      return res.status(200).json({
        success: true ,
        message : "Member updated successfully.",
        member : updatedMember
      })
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      success: false ,
      message : "something went wrong.",
      error :err
    })
  }
};

// delete member...
exports.deleteMember = async (req, res) => {
  try {
    const id = req.params.id;
    const currrecord = await Record.findOne({
      memberId: new mongoose.Types.ObjectId(id),
    });
    const page = +req.query.page || 1;
    const Member_On_Page = 6;
    const totalItems = +req.query.totalItems || Member_On_Page;
    const totalMember = await Member.find().countDocuments();
    const deleteToMember = await Member.findById(id);

    const memberDetails = await Member.find()
      .skip((page - 1) * totalItems)
      .limit(totalItems).sort({ createdAt: -1 });

    if (currrecord) {
      for (let book of currrecord.book) {
        if (book.status !== "returned") {
          return res.status(400).json({
            success :false ,
            message : "Some book is not return by user."
          })
        }
      }
    }

    if (deleteToMember.membershipStatus == "active") {
      return res.status(400).json({
        success :false ,
        message : "Active members cant be deleted."
      })
    }
 const deleteMember =   await Member.findByIdAndDelete(id);
    const deleteRecord = await Record.findOneAndDelete({
      memberId: new mongoose.Types.ObjectId(id),
    });
    return res.status(200).json({
      success :true ,
      message : "Member deleted successfully.",
      member : deleteMember
    })
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success : false ,
      message : "something went wrong.",
      error : err
    })
  }
};

exports.filterMember = async (req, res) => {
  try {
    let { filter } = req.query;
    
    let filterArr = [];
    if (filter) {
      filter = filter.replace(/[^\w\s]/g, "");
      filterArr.push({ uId: { $regex: new RegExp(`${filter}`, "i") } });
      filterArr.push({ name: { $regex: new RegExp(`${filter}`, "i") } });
      filterArr.push({ email: { $regex: new RegExp(`${filter}`, "i") } });
      filterArr.push({ memberType: { $regex: new RegExp(`${filter}`, "i") } });
      filterArr.push({
        membershipStatus: { $regex: new RegExp(`^${filter}$`, "i") },
      });
    }
    else{
      filterArr.push({})
    }
      
    const query = filterArr.length > 0 
  ? { 
      $and: [
        { $or: filterArr },
        { memberType: { $in: ["student", "faculty", "guest"] } }
      ]
    } 
  : { memberType: { $in: ["student", "faculty", "guest"] } };

    const totalMember = await Member.find(query).countDocuments();

    const page = +req.query.page || 1;
    const Member_On_Page = 6;
    const totalItems = +req.query.totalItems || Member_On_Page;
    
    const findedMember = await Member.find(query).select("-password -profile -prefferdCategories -resetPasswordToken")
      .skip((page - 1) * totalItems)
      .limit(totalItems).sort({ createdAt: -1 });

    return res.status(200).json({
      success : true,
      message : "Member filter successfully.",
      totalMembers :totalMember,
      data :findedMember
    })
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      success : false,
      message : "Something went Wrong.",
      error : error
    })
  }
};

exports.sortMember = async (req, res) => {
  try {
    const field = req.query.field;
    const sortOrder = req.query.sortOrder;
    // console.log("sortOrder" , sortOrder ,"field", field)

    const sort = {};
    sort[field] = sortOrder === "desc" ? -1 : 1;
    if(!sort)
    {
      const member = await Member.find({memberType : {$in : ["student" , "faculty" , "guest"]}})
      .select("-password -profile -prefferdCategories -resetPasswordToken")
      .skip((page - 1) * totalItems)
      .limit(totalItems);
      return res.status(200).json({
        success : true,
        message : "Member filter successfully.",
        totalMembers :totalMember,
        data :member
      })
    }
    const totalMember = await Member.countDocuments( { memberType: { $in: ["student", "faculty", "guest"] } });
    const page = +req.query.page || 1;
    const Member_On_Page = 6;
    const totalItems = +req.query.totalItems || Member_On_Page;
    const member = await Member.find({memberType : {$in : ["student" , "faculty" , "guest"]}})
      .sort(sort)
      .select("-password -profile -prefferdCategories -resetPasswordToken")
      .skip((page - 1) * totalItems)
      .limit(totalItems);
      return res.status(200).json({
        success : true,
        message : "Member filter successfully.",
        totalMembers :totalMember,
        data :member
      })
  } catch (error) {
    console.log(error);
 
    return res.status(200).json({
      success : false,
      message : "Something went Wrong.",
      error : error
    })
  }
};
