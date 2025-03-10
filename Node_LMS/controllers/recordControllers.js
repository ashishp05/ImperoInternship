const Record = require("../models/borrowRecordModel");
const Member = require("../models/memberModel");
const Book = require("../models/bookModel");
const { default: mongoose, Types } = require("mongoose");
const {validationResult} = require("express-validator")
exports.getRecordDetails = async (req, res) => {
  try {
    const record = await Record.find()
      .populate("book.bookId")
      .populate("memberId");

    return res.render("record/record-details", {
      title: "Record details Page",
      record: record,
      member: await Member.find(),
      error: null,
      oldInput: {},
      edit: false,
    });
  } catch (err) {
    console.log(err);
    return res.render("record/record-details", {
      title: "Record details Page",
      error: "Something Went wrong...",
      record: await Record.find().populate("book.bookId"),
      oldInput: {},
      edit: false,
    });
  }
};

exports.getAddRecord = async (req, res) => {
  try {
    return res.render("record/add-record", {
      title: "Add Record Page",
      error: null,
      member: await Member.find({ membershipStatus: "active" }).sort({name : 1}),
      book: await Book.find({ status: "available" }).sort({title : 1}),
      oldInput: {},
      edit: false,
    });
  } catch (err) {
    console.log(err);
    return res.render("record/add-record", {
      title: "Add Record Page",
      error: "Something Went wrong...",
      member: await Member.find({ membershipStatus: "active" }).sort({name : 1}),
      book: await Book.find({ status: "available" }).sort({title : 1}),
      oldInput: {},
      edit: false,
    });
  }
};

exports.addRecord = async (req, res) => {
  try {
    const { memberId, bookId, issueDate, dueDate, status } = req.body;

    if (!memberId || !bookId || !issueDate || !dueDate || !status) {
      return res.render("record/add-record", {
        title: "Add Record Page",
        error: "All fields Are Required.",
        member: await Member.find({ membershipStatus: "active" }).sort({name : 1}),
        book: await Book.find({ status: "available" }).sort({title : 1}),
        oldInput: req.body,
        edit: false,
      });
    }

    const issuedate = new Date(issueDate);
    const duedate = new Date(dueDate);
     
 if( duedate - issuedate  > 30*24*60*60*1000)
    {
      return res.render("record/add-record", {
        title: "Add Record Page",
        error: "Member can borrow book for maximum 30 days.",
        member: await Member.find({ membershipStatus: "active" }).sort({name : 1}),
        book: await Book.find({ status: "available" }).sort({title : 1}),
        oldInput: req.body,
        edit: false,
      });
    }

    if (issuedate.getTime() > new Date()) {
      return res.render("record/add-record", {
        title: "Add Record Page",
        error: "IssueDate is always today or Past-date.",
        member: await Member.find({ membershipStatus: "active" }).sort({name : 1}),
        book: await Book.find({ status: "available" }).sort({title : 1}),
        oldInput: req.body,
        edit: false,
      });
    }

    if (issuedate.getTime() > duedate.getTime()) {
      return res.render("record/add-record", {
        title: "Add Record Page",
        error: "Due date must be after the issue date.",
        member: await Member.find({ membershipStatus: "active" }).sort({name : 1}),
        book: await Book.find({ status: "available" }).sort({title : 1}),
        oldInput: req.body,
        edit: false,
      });
    }

    const existingRecord = await Record.findOne({
      memberId: new mongoose.Types.ObjectId(memberId),
    });
    //  console.log("existing record" , existingRecord )

    const selectedBook = await Book.findOne({
      _id: new mongoose.Types.ObjectId(bookId),
    });

    const bookQuantity = selectedBook.availableQuantity;
    const borrowedQuantity = selectedBook.borrowedQuantity;
    const maintenanceQuantity = selectedBook.maintenanceQuantity;
    if (selectedBook.status === "maintenance") {
      return res.render("record/add-record", {
        title: "Add Record Page",
        error: "This book is currently in maintenance and cannot be borrowed.",
        member: await Member.find({ membershipStatus: "active" }).sort({name : 1}),
        book: await Book.find({ status: "available" }).sort({title : 1}),
        oldInput: req.body,
        edit: false,
      });
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
        return res.render("record/add-record", {
          title: "Add Record Page",
          error: "You have already this book.",
          member: await Member.find({ membershipStatus: "active" }).sort({name : 1}),
          book: await Book.find({ status: "available" }).sort({title : 1}),
          oldInput: req.body,
          edit: false,
        });
      }
      // console.log(existingRecordOfBorrowedBook, existingRecordOfBorrowedBook.length);

      if (existingRecordOfBorrowedBook.length >= 3) {
        return res.render("record/add-record", {
          title: "Add Record Page",
          error: "At a time only 3 books can borrow",
          member: await Member.find({ membershipStatus: "active" }).sort({name : 1}),
          book: await Book.find({ status: "available" }).sort({title : 1}),
          oldInput: req.body,
          edit: false,
        });
      }
    }

    if (bookQuantity <= 0) {
      await Book.findByIdAndUpdate(
        { _id: bookId },
        { $set: { status: "borrowed", availableQuantity: 0 } }
      );

      return res.render("record/add-record", {
        title: "Add Record Page",
        error: "This Book is Not available to Read.",
        member: await Member.find({ membershipStatus: "active" }).sort({name : 1}),
        book: await Book.find({ status: "available" }).sort({title : 1}),
        oldInput: req.body,
        edit: false,
      });
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
        { $push: { book: { bookId, issueDate, dueDate, status } } }
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

      return res.redirect("/record/record-details");
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

      return res.render("record/add-record", {
        title: "Add Record Page",
        error: error,
        member: await Member.find({ membershipStatus: "active" }).sort({name : 1}),
        book: await Book.find({ status: "available" }).sort({title : 1}),
        record: await Record.find(),
        edit: false,
        oldInput: req.body,
      });
    }

    await record.save();
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

    res.redirect("/record/record-details");
  } catch (err) {
    console.log(err);
    return res.render("record/add-record", {
      title: "Add Record Page",
      error: "Something Went wrong...",
      member: await Member.find({ membershipStatus: "active" }).sort({name : 1}),
      book: await Book.find({ status: "available" }).sort({title : 1}),
      record: await Record.find(),
      oldInput: req.body,
      edit: false,
    });
  }
};

exports.getEditRecord = async (req, res) => {
  try {
    const edit = req.query.edit;
    const id = req.params.rid;
    const bookid = req.params.bid;

    const record = await Record.findOne({
      _id: new mongoose.Types.ObjectId(id),
    })
      .populate("book.bookId")
      .populate("memberId");

    const currBook = await Book.findById(new mongoose.Types.ObjectId(bookid));

    const matchedBook = record.book.filter(
      (rec) => rec.bookId._id.toString() == currBook._id.toString()
    );

    const oldInput = {
      memberId: record.memberId._id.toString(),
      bookId: currBook._id,
      issueDate: matchedBook[0].issueDate,
      dueDate: matchedBook[0].dueDate,
      status: matchedBook[0].status,
    };
    // console.log("oldinput in controller" , oldInput)

    res.render("record/add-record", {
      title: "Edit Record Page",
      error: null,
      oldInput: oldInput,
      member: await Member.find({ membershipStatus: "active" }),
      book: await Book.find(),
      record: await Record.findOne({ _id: new mongoose.Types.ObjectId(id) })
        .populate("book.bookId")
        .populate("memberId"),
      currBook,
      edit: edit,
    });
  } catch (err) {
    console.log(err);
    return res.render("record/add-record", {
      title: "Edit Record Page",
      error: "Something Went wrong...",
      member: await Member.find({ membershipStatus: "active" }),
      book: await Book.find({ status: "available" }),
      record: await Record.find(),
      currBook: await Book.findById(
        new mongoose.Types.ObjectId(req.params.bid)
      ),
      oldInput: {},
      edit: true,
    });
  }
};

exports.postEditRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("record/add-record", {
        title: "Edit record Page",
        error: errors.array()[0].msg,
        member: await Member.find(),
        edit: true,
        oldInput: req.body,
      });
    }
    const { memberId, bookId, issueDate, dueDate, status } = req.body;
    const { id, bookid } = req.body;

    const record = await Record.findOne({ _id: id })
      .populate("book.bookId")
      .populate("memberId");

    const currBook = await Book.findById(bookid);
    const selectedBook = await Book.findById(bookId);
    const member = await Member.find({ membershipStatus: "active" }).sort({name : 1});
    const availableBooks = await Book.find({ status: "available" }).sort({title :1});
    const bookQuantity = selectedBook.availableQuantity;
    const borrowedQuantity = selectedBook.borrowedQuantity;
    const maintenanceQuantity = selectedBook.maintenanceQuantity;

    const renderPage = (error, edit = true) => {
      return res.render("record/add-record", {
        title: edit ? "Edit Record Page" : "Add Record Page",
        error,
        member,
        book: availableBooks,
        record,
        oldInput: req.body,
        edit,
        currBook,
      });
    };

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

    if( duedate - issuedate  > 30*24*60*60*1000)
      {
        
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
      return res.redirect("/record/record-details");
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
        return res.redirect("/record/record-details");
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
    }
    // console.log("maintanance");
    await Book.findByIdAndUpdate(
      { _id: bookId },
      { $set: { availableQuantity: bookQuantity - 1 } }
    );

    res.redirect("/record/record-details");
  } catch (err) {
    console.error(err);
    const record = await Record.find().populate("book.bookId");
    const currBook = await Book.findById(req.body.bookid);
    return res.render("record/add-record", {
      title: "Edit Record Page",
      error: "something went wrong",
      member: await Member.find().sort({ status: 1 }),
      book: await Book.find().sort({ status: 1 }),
      record,
      oldInput: req.body,
      edit: true,
      currBook,
    });
  }
};

exports.deleteRecord = async (req, res) => {
  try {
    const id = req.params.id;
    const bookid = req.params.bookid;
    const currrecord = await Record.findById(new mongoose.Types.ObjectId(id));

    const bookArrayLength = currrecord.book.length;

    const deleteBook = currrecord.book.find(
      (book) => book.bookId.toString() == bookid.toString()
    );

    if (!deleteBook) {
      return res.render("record/record-details", {
        title: "Record Details Page",
        error: "Book is not found.",
        member: await Member.find(),
        book: await Book.find({ status: "available" }),
        edit: false,
        record: await Record.find()
          .populate("book.bookId")
          .populate("memberId"),
      });
    }

    if (deleteBook.status != "returned") {
      return res.render("record/record-details", {
        title: "Record Details Page",
        error: "This book is not returned by the user.",
        member: await Member.find(),
        book: await Book.find({ status: "available" }),
        edit: false,
        record: await Record.find()
          .populate("book.bookId")
          .populate("memberId"),
      });
    }
    if (bookArrayLength > 1) {
      await Record.findByIdAndUpdate(id, {
        $pull: { book: { bookId: bookid } },
      });
    } else {
      await Record.findByIdAndDelete(id);
    }

    res.redirect("/record/record-details");
  } catch (err) {
    console.log(err);
    return res.render("record/record-details", {
      title: "Record Details Page",
      error: "something went wrong...",
      member: await Member.find(),
      book: await Book.find({ status: "available" }),
      edit: false,
      record: await Record.find()
        .populate("book.bookId")
        .populate("memberId"),
    });
   
  }
};
