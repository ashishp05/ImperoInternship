const Record = require("../models/borrowRecordModel");
const Member = require("../models/memberModel");
const Book = require("../models/bookModel");
const { default: mongoose, Types } = require("mongoose");
const { validationResult } = require("express-validator");
exports.getRecordDetails = async (req, res) => {
  try {
    const totalRecord = await Record.find().countDocuments();
    const page = +req.query.page || 1;
    const Record_On_Page = 3;
   const totalItems = +req.query.totalItems || Record_On_Page ;
    const record = await Record.find()
      .populate({path :"book.bookId" , select : " title "})
      .populate({path : "memberId" , select : "-password -prefferdCategories -resetPasswordToken"}) 
      .skip((page - 1) * totalItems)
      .limit(totalItems)
      .sort({ createdAt: -1 });
   return res.status(200).json({
    success :true ,
    message : "Record details fetched successfully.",
    totalItems : totalRecord,
    record
   })
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success :false ,
      message : "something went wrong.",
     error : err
     })
  }
};

exports.addRecord = async (req, res) => {
  try {
    const { memberId, bookId, issueDate, dueDate, status } = req.body;

    if (!memberId || !bookId || !issueDate || !dueDate || !status) {
     return res.status(400).json({
      success : false ,
      message : "All fileds are required.",
     })
    }

    const issuedate = new Date(issueDate);
    const duedate = new Date(dueDate);

    if (duedate - issuedate > 30 * 24 * 60 * 60 * 1000) {
      return res.status(400).json({
        success : false ,
        message : "Member can borrow book for maximum 30 days.",
       })
    }

    if (issuedate.getTime() > new Date()) {
      return res.status(400).json({
        success : false ,
        message : "IssueDate is always today or Past-date.",
       })
  
    }
   
    if (issuedate.getTime() > duedate.getTime()) {
      return res.status(400).json({
        success : false ,
        message : "Due date must be after the issue date.",
       })
  
      
    }

    const existingRecord = await Record.findOne({
      memberId: new mongoose.Types.ObjectId(memberId),
    }).sort({ createdAt: -1 });
    //  console.log("existing record" , existingRecord )

    const selectedBook = await Book.findOne({
      _id: new mongoose.Types.ObjectId(bookId),
    });
   if(!selectedBook)
   {
    return res.status(404).json({
      success : false ,
      message : "This book is not found."
    })
   }
    const bookQuantity = selectedBook.availableQuantity;
    const borrowedQuantity = selectedBook.borrowedQuantity;
    const maintenanceQuantity = selectedBook.maintenanceQuantity;
    if (selectedBook.status === "maintenance") {
      
      return res.status(400).json({
        success : false ,
        message : "This book is currently in maintenance and cannot be borrowed.",
       })
    }

    if (existingRecord) {
      const bookObject = existingRecord.book;
      let existBooks = [];
      let existingRecordOfBorrowedBook = [];

      bookObject.forEach((book) => {
        if (
          book.bookId.toString() == bookId.toString() &&
          book.status != "returned"
        ) {
          existBooks.push(book);
        }
      });

      bookObject.forEach((book) => {
        if (book.status != "returned") {
          existingRecordOfBorrowedBook.push(book);
        }
      });
 
      //  console.log("existing books" , existBooks)
      if (existBooks.length > 0 && existBooks[0].status == "borrowed") {
        return res.status(400).json({
          success : false ,
          message : "You have already this book.",
         })
      }
      // console.log(existingRecordOfBorrowedBook, existingRecordOfBorrowedBook.length);

      if (existingRecordOfBorrowedBook.length >= 3) {
        return res.status(400).json({
          success : false ,
          message : "At a time only 3 books are Borrowed.",
         })
      }
    }

    if (bookQuantity <= 0) {
      await Book.findByIdAndUpdate(
        { _id: bookId },
        { $set: { status: "borrowed", availableQuantity: 0 } }
      );

      return res.status(400).json({
        success : false ,
        message : "This book is not available to read.",
       })
    }
    if (bookQuantity <= 1) {
      await Book.findByIdAndUpdate(
        { _id: bookId },
        { $set: { status: "borrowed", availableQuantity: 0 } }
      );
    }
    if (existingRecord) {
      const updateRecord = await Record.findOneAndUpdate(
        { memberId: new mongoose.Types.ObjectId(memberId) },
        { $push:  { book: { bookId, issueDate, dueDate, status } } }
      );
      const updatedQuantity = await Book.findByIdAndUpdate(
        { _id: new mongoose.Types.ObjectId(bookId) },
        {
          $set: {
            availableQuantity: bookQuantity - 1,
            borrowedQuantity: borrowedQuantity + 1,
          },
        }
      );  

      return res.status(200).json({
        success : true ,
        message : "Book record add successfully",
        data : updateRecord
       })
    }

    const record = new Record({
      memberId: memberId,
      book: { bookId, issueDate, dueDate, status },
    });

    const error = record.validateSync();
    if (error) {
      const errorMessages = [];

      for (const field in error.errors) {
        errorMessages.push(error.errors[field].message);
      }

      return res.status(200).json({
        success : false ,
        message : "Error in validation.",
        error : error
       })
      }
   const addedRecord =await (await record.save()).populate("memberId");
    //  console.log("bookQuantity" , bookQuantity)

    const updatedQuantity = await Book.findByIdAndUpdate(
      { _id: new mongoose.Types.ObjectId(bookId) },
      {
        $set: {
          availableQuantity: bookQuantity - 1,
          borrowedQuantity: borrowedQuantity + 1,
        },
      }
    );

    return res.status(200).json({
      success : true ,
      message : "Book record add successfully",
      data : addedRecord
     })
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success : false ,
      message : "something went wrong.",
      error : err})
  }
};

exports.postEditRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
     return res.status(400).json({
      success :false,
      message : "Error in validations",
      error :errors.array[0].msg
     })
    }
    const { memberId, bookId, issueDate, dueDate, status } = req.body;
    const { rid, bid } = req.params;

    const record = await Record.findOne({ _id: rid })
    .populate({path :"book.bookId" , select : " title "})
    .populate({path : "memberId" , select : "-password -prefferdCategories -resetPasswordToken"})
  .sort({ createdAt: -1 });

  if(!record)
  {
    return res.status(404).json({
      success : false,
      message : "Record not found."
    })
  }
    const currBook = await Book.findById(bid);
    const selectedBook = await Book.findById(bid);
    const bookQuantity = selectedBook.availableQuantity;
    const borrowedQuantity = selectedBook.borrowedQuantity;

    const renderPage = (error, edit = true) => {
      return res.status(400).json({
        success :false,
        message :error ,
         
       })
    };
    console.log(record)

    const selectedMemberId = record.memberId._id;

    if (
      currBook._id.toString() != bookId.toString() ||
      selectedMemberId.toString() != memberId.toString()
    ) {
      return renderPage("You cannot change the member and book.");
    }

    if (!memberId || !bookId || !issueDate || !dueDate || !status) {
      return renderPage("All fields are required.");
    }

    const issuedate = new Date(issueDate);
    const duedate = new Date(dueDate);

    if (
      currBook.status != "delayed" &&
      duedate - issuedate > 30 * 24 * 60 * 60 * 1000
    ) {
      return renderPage("Member can borrow book for maximum 30 days.");
    }

    if (issuedate > new Date()) {
      return renderPage("Issue date must be today or earlier.", false);
    }

    if (issuedate > duedate) {
      return renderPage("Due date must be after the issue date.");
    }

    if (status === "delayed") {
      if (new Date() > duedate.getTime() + 1000 * 60 * 60 * 24) {
        const updatedRecord = await Record.findOne({ memberId });
        updatedRecord.book.forEach((book) => {
          if (book.bookId.toString() === bookId.toString()) {
            book.status = status;
          }
        });
        await updatedRecord.save();
      } else {
        return renderPage("Due date must be past to mark as delayed.");
      }
    }

    if (status === "returned") {
      const updatedRecord = await Record.findOne({ memberId });
      updatedRecord.book.forEach((book) => {
        if (book.bookId.toString() === bookId.toString()) {
          book.status = status;
        }
      });

      await updatedRecord.save();

      await Book.findByIdAndUpdate(
        { _id: bookId },
        {
          $set: {
            availableQuantity:
              bookQuantity < selectedBook.quantity
                ? bookQuantity + 1
                : selectedBook.quantity,
            status: "available",
            borrowedQuantity: borrowedQuantity > 0 ? borrowedQuantity - 1 : 0,
          },
        }
      );
      return res.status(200).json({
        success :true,
        message : "Record updated successfully.",
      record: updatedRecord
       })
    }

    const existingRecord = await Record.findOne({ memberId });

    // console.log("existing book ", duedate, issuedate, existingRecord);
    if (existingRecord) {
      const existingBook = existingRecord.book.find(
        (book) => book.bookId.toString() === bookId.toString()
      );

      if (existingBook && existingBook.status !== "returned") {
        existingBook.issueDate = issuedate;
        existingBook.dueDate = duedate;
        await existingRecord.save();
        return res.status(200).json({ 
          success :true,
          message : "Record updated successfully.",
        record: existingRecord
         })
      }

      if (!existingBook || existingBook.status === "returned") {
        return renderPage("You cannot edit this after return.");
      }
    } else {
      const newRecord = new Record({
        book: [{ issueDate, dueDate, status }],
      });

      const validationError = newRecord.validateSync();
      if (validationError) {
        const errorMessages = Object.values(validationError.errors).map(
          (error) => error.message
        );
        return renderPage(errorMessages.join(", "));
      }

      await newRecord.save();
      await Book.findByIdAndUpdate(
        { _id: bookId },
        { $set: { availableQuantity: bookQuantity - 1 } }
      );
    return res.status(200).json({
      success :true,
      message : "Record updated successfully.",
      record: newRecord
     }) 
    }
    // console.log("maintanance");
    await Book.findByIdAndUpdate(
      { _id: bookId },
      { $set: { availableQuantity: bookQuantity - 1 } }
    );

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success :false,
      message : "something went wrong.",
   error : err
     })
   
  }
};

exports.deleteRecord = async (req, res) => {
  try {
    const id = req.params.id;
    const bookid = req.params.bid;
    const currrecord = await Record.findById(new mongoose.Types.ObjectId(id));

    const bookArrayLength = currrecord.book.length;
    const page = +req.query.page || 1;
    const Record_On_Page = 3;
    const totalItems =  +req.query.totalItems || Record_On_Page
    const totalRecord = await Record.find().countDocuments();
    const record = await Record.find()
      .populate("book.bookId")
      .populate("memberId")
      .skip((page - 1) * totalItems)
      .limit(totalItems).sort({ createdAt: -1 });;

    const deleteBook = currrecord.book.find(
      (book) => book.bookId.toString() == bookid.toString()
    );

    if (!deleteBook) {
      return res.status(404).json({
        success : false ,
        message : "Book is not found.",
       })
    }

    if (deleteBook.status != "returned") {
      return res.status(400).json({
        success : false ,
        message : "Books is not returned, so ,record cannot be deleted.",
       })
    }
    if (bookArrayLength > 1) {
      await Record.findByIdAndUpdate(id, {
        $pull: { book: { bookId: bookid } },
      });
    } else {
      await Record.findByIdAndDelete(id);
    }

    return res.status(200).json({
      success : true ,
      message : "Record deleted successfully.",
     })
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success : false ,
      message : "something went wrong.",
      error : err})
  }
};

exports.filterRecord = async (req, res) => {
  try {
    const { filter, email, book, issueDate, dueDate, status } = req.query;
    const page = +req.query.page || 1;
    const Record_On_Page = 3;
  const totalItems = +req.query.totalItems || Record_On_Page
    let filterArr = [];

    if (filter) {
      const memberUID = await Member.find({
        name: { $regex: new RegExp(`${filter}`, "i") },
      });
      

      memberUID.forEach((m) => {
        filterArr.push({
          memberId: m._id,
        });
      });
      
      const member = await Member.find({
        name: { $regex: new RegExp(`${filter}`, "i") },
      });
      

      member.forEach((m) => {
        filterArr.push({
          memberId: m._id,
        });
      });
    
      const memberE = await Member.find({
        email: { $regex: new RegExp(`${filter}`, "i") },
      });
      if (memberE.length <= 0 && memberUID.length <=0 && member.length <=0) {
        return res.status(404).json({
          success: false ,
          message : "Record is not found"
        })
      }

      memberE.forEach((m) => {
        filterArr.push({
          memberId: m._id,
        });
      });
  
    }else {
      filterArr.push({})
    }
    const query = filterArr.length > 0 ? { $or: filterArr } : {};
    totalRecord = await Record.find(query).countDocuments();
    const findedRecord = await Record.find(query)
    .populate({path :"book.bookId" , select : " title "})
    .populate({path : "memberId" , select : "-password -prefferdCategories -resetPasswordToken"})
      .skip((page - 1) * totalItems)
      .limit(totalItems)
      .sort({ createdAt: -1 });

   return res.status(200).json({
    success : true ,
    message : "Record filterd successfully.",
    totalItems : totalRecord,
    data : findedRecord
   })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success : false ,
      message : "Something went wrong.",
      data : error
     })
  }
};

exports.sortRecord = async (req, res) => {
  try {
    const { field, sortOrder } = req.query;
    const sort = {};
    sort[field] = sortOrder === "desc" ? -1 : 1;

  
    const page = +req.query.page || 1;
    const Record_On_Page = 3;
    const totalRecord = await Record.countDocuments();
    const totalItems = +req.query.totalItems || Record_On_Page
    const skip = (page - 1) * totalItems;
    const record = await Record.aggregate([
      {
        $lookup: {
          from: "members",
          localField: "memberId",
          foreignField: "_id",
          as: "memberId",
        },
      },
      {
        $unwind: {
          path: "$memberId",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: "books",
          localField: "book.bookId",
          foreignField: "_id",
          as: "bookdetails",
        },
      },

      {
        $addFields: {
          title: "$bookdetails.title",
        },
      },

      {
        $sort: {
          [field]: sortOrder === "desc" ? -1 : 1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: totalItems,
      },
    ]);
  
    return res.status(200).json({
      success : true ,
      message : "Record filterd successfully.",
      totalItems : totalRecord,
      data : record
     })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success : false ,
      message : "Something went wrong.",
      data : error
     })
  }
};

exports.showMyRecords = async ( req, res ) =>
{
  try {
    const totalRecord = await Record.find({memberId : req.user._id}).countDocuments();
    const page = +req.query.page || 1;
    const Record_On_Page = 3;
   const totalItems = +req.query.totalItems || Record_On_Page ;
   console.log(req.user._id)
    const record = await Record.find({memberId : req.user._id})
      .populate({path :"book.bookId" , select : " title "})
      .populate({path : "memberId" , select : "-password -prefferdCategories -resetPasswordToken"})
      .skip((page - 1) * totalItems)
      .limit(totalItems)
      .sort({ createdAt: -1 });
   return res.status(200).json({
    success :true ,
    message : "Record details fetched successfully.",
    totalItems : totalRecord,
    record
   })
  } catch (error) {
  
    console.log(error)
    return res.status(500).json({
      success : false ,
      message : "Something went wrong.",
      data : error
     })
  }
}