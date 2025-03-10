// import models
const Member = require("../models/memberModel");
const Record = require("../models/borrowRecordModel");
const Book = require("../models/bookModel");

const { default: mongoose } = require("mongoose");
const { validationResult } = require("express-validator");
// Add member Page
exports.getAddMember = async (req, res) => {
  try {
    return res.render("member/add-member", {
      title: "Add Member Page",
      error: null,
      edit: false,
      oldInput: {},
    });
  } catch (err) {
    console.log(err);
    return res.render("member/add-member", {
      title: "Add Member Page",
      error: "Something Went wrong...",
      edit: false,
      oldInput: {},
    });
  }
};

// fatch all members
exports.getMemberDetails = async (req, res) => {
  try {
    const member = await Member.find()
      .sort({ membershipStatus: 1 })
      .sort({ name: 1 });
    return res.render("member/member-details", {
      title: "Member Details Page",
      member: member,
      error: null,
      edit: false,
    });
  } catch (err) {
    console.log(err);
    return res.render("member/member-details", {
      title: "Member Details Page",
      error: "Something Went wrong...",
      edit: false,
    });
  }
};

// Add member in Database
exports.addMemeber = async (req, res) => {
  try {
    const { name, email, memberType, membershipStatus } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("member/add-member", {
        title: "Add Member Page",
        error: errors.array()[0].msg,
        member: await Member.find(),
        edit: false,
        oldInput: req.body,
      });
    }

    if (!name || !email || !memberType || !membershipStatus) {
      return res.render("member/add-member", {
        title: "Add Member Page",
        member: await Member.find(),
        error: "All fields are required.",
        edit: false,
        oldInput: req.body,
      });
    }
    const existingMember = await Member.findOne({ email: email });

    if (existingMember) {
      return res.render("member/member-details", {
        title: "Add Member Page",
        member: await Member.find(),
        error: "Member is already Exist.",
        edit: false,
        oldInput: req.body,
      });
    }

    const member = new Member({ name, email, memberType, membershipStatus });
    const error = member.validateSync();

    if (error) {
      const errorMessages = [];

      for (const field in error.errors) {
        errorMessages.push(error.errors[field].message);
      }

      return res.render("member/add-member", {
        title: "Add Member Page",
        error: error,
        member: await Member.find(),
        edit: false,
        oldInput: req.body,
      });
    }
    await member.save();

    res.redirect("/member/member-details");
  } catch (err) {
    console.log(err);
    return res.render("member/add-member", {
      title: "Add Member Page",
      member: await Member.find(),
      error: "Something went wrong...",
      edit: false,
      oldInput: req.body,
    });
  }
};

// Edit member Page
exports.geteditMember = async (req, res) => {
  try {
    const edit = req.query.edit;
    const id = req.params.id;

    const member = await Member.findById(id);
    const oldInput = {
      name: member.name,
      email: member.email,
      memberType: member.memberType,
      membershipStatus: member.membershipStatus,
    };

    if (!member) {
      return res.render("member/add-member", {
        title: "Edit Member Page",
        member: await Member.find(),
        error: "Member is not Found..",
        edit: edit,
        oldInput: oldInput,
      });
    }
    return res.render("member/add-member", {
      title: "Edit Member Page",
      error: null,
      member: member,
      edit: edit,
      oldInput: oldInput,
    });
  } catch (err) {
    console.log(err);
    return res.render("member/add-member", {
      title: "Edit-member Page",
      member: await Member.find(),
      error: "Member is not Found..",
      edit: false,
      oldInput: {},
    });
  }
};

//  Edit member in DB
exports.postEditMember = async (req, res) => {
  try {
    const { name, email, memberType, membershipStatus, id } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("member/add-member", {
        title: "Edit Member Page",
        error: errors.array()[0].msg,
        member: await Member.find(),
        edit: true,
        oldInput: req.body,
      });
    }
    if (!name || !email || !memberType || !membershipStatus || !id) {
      return res.render("member/add-member", {
        title: "Edit Member Page",
        member: await Member.find(),
        error: "All fields are required.",
        edit: true,
        oldInput: req.body,
      });
    }

    const currrecord = await Record.findOne({
      memberId: new mongoose.Types.ObjectId(id),
    });

    if (currrecord && membershipStatus == "inactive") {
      for (let book of currrecord.book) {
        if (book.status !== "returned") {
          return res.render("member/member-details", {
            title: "Member Details Page",
            error:"Some books are not returned by user so user can't be inactive.",
            member: await Member.find(),
            book: await Book.find({ status: "available" }),
            edit: false,
            record: await Record.find()
              .populate("book.bookId")
              .populate("memberId"),
          });
        }
      }
    }

    const updatedMember = await Member.findByIdAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { name, email, memberType, membershipStatus }
    );

    const existingMember = await Member.find({ email: email });

    if (!(existingMember.length == 1)) {
      return res.render("member/member-details", {
        title: "Member Details Page",
        member: await Member.find(),
        error: "Member is already Exist.",
        edit: true,
        oldInput: req.body,
      });
    }
    res.redirect("/member/member-details");
  } catch (err) {
    console.log(err);
    return res.render("member/add-member", {
      title: "Edit member Page",
      member: await Member.find(),
      error: "Something went wrong...",
      edit: true,
      oldInput: req.body,
    });
  }
};

// delete member...
exports.deleteMember = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const currrecord = await Record.findOne({
      memberId: new mongoose.Types.ObjectId(id),
    });
    console.log(currrecord);

    if (currrecord) {
      for (let book of currrecord.book) {
        if (book.status !== "returned") {
          return res.render("member/member-details", {
            title: "Member Details Page",
            error: " Some books are not returned by member.",
            member: await Member.find(),
            book: await Book.find({ status: "available" }),
            edit: false,
            record: await Record.find()
              .populate("book.bookId")
              .populate("memberId"),
          });
        }
      }
    }

    const deleteMember = await Member.findByIdAndDelete(
      new mongoose.Types.ObjectId(id)
    );
    const deleteRecord = await Record.findOneAndDelete({
      memberId: new mongoose.Types.ObjectId(id),
    });
    res.redirect("/member/member-details");
  } catch (err) {
    console.log(err);
    return res.render("member/member-details", {
      title: "Member Details Page",
      error: "Something Went wrong...",
      member: await Member.find(),
      edit: false,
    });
  }
};
