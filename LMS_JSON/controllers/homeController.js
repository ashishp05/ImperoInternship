const Member = require("../models/memberModel");
const Book = require("../models/bookModel");
const Record = require("../models/borrowRecordModel");
const { default: mongoose } = require("mongoose");
const { success } = require("toastr");
exports.getDashboardAdmin = async (req, res) => {
  try {
   
    const active = await Member.find({
      membershipStatus: "active",
      memberType: { $in: ["student", "faculty", "guest"] },
    }).countDocuments();
    const inactive = await Member.find({
      membershipStatus: "inactive",
      memberType: { $in: ["student", "faculty", "guest"] },
    }).countDocuments();

   const member = await Member.find({
          memberType: { $in: ["student", "faculty", "guest"] },
        }).countDocuments()
    const  book = await Record.find().countDocuments()
    

    return  res.status(200).json({
        success : true ,
        message : "Dashboard Details Fetched Successfully",
         data : {
            member : member ,
            book : book,
            active: active,
            inactive: inactive,
            user: req.user._id,
         }
      })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
        success : false ,
        message : "something went wrong",
        error : error

    })
  }
};



exports.getDashboardUser = async (req, res) => {
    try {
      let borrowedCount = 0;
      let delayedCount = 0;
      let returnedCount = 0;
      const record = await Record.find({
        memberId: new mongoose.Types.ObjectId(req.user._id),
      })
      .populate({path :"book.bookId" , select : " title "})
      .populate({path : "memberId" , select : "-password -prefferdCategories -resetPasswordToken"})
      const  book = record[0].book.length
      if (record.length <= 0) {
        return  res.status(200).json({
          success : true ,
          message : "Dashboard Details Fetched Successfully",
           data : {
              book : book,
              record: record,
              borrowedCount: borrowedCount,
              delayedCount: delayedCount,
              returnedCount: returnedCount,
              user: req.user._id,
           }
        })
      }
      const bookArray = record[0].book;
  
      bookArray.forEach((book) => {
        if (book.status == "borrowed") {
          borrowedCount++;
        } else if (book.status == "returned") {
          returnedCount++;
        } else if (book.status == "delayed") {
          delayedCount++;
        }
      });
  
      return  res.status(200).json({
          success : true ,
          message : "Dashboard Details Fetched Successfully",
           data : {
           
              book : book,
              record: record,
              borrowedCount: borrowedCount,
              delayedCount: delayedCount,
              returnedCount: returnedCount,
              user: req.user._id,
           }
        })
    } catch (error) {
      console.log(error);
      return res.status(500).json({
          success : false ,
          message : "something went wrong",
          error : error
  
      })
    }
  };
  