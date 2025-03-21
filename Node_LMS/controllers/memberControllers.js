// import models
const Member = require("../models/memberModel");
const Record = require("../models/borrowRecordModel");

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
    const member = await Member.find().sort({ uId: 1 });
    return res.render("member/member-details", {
      title: "Member Details Page",
      member: member,
      error: null,
      oldInput: {},
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
        edit: false,
        oldInput: req.body,
      });
    }

    if (!name || !email || !memberType || !membershipStatus) {
      return res.render("member/add-member", {
        title: "Add Member Page",
        error: "All fields are required.",
        edit: false,
        oldInput: req.body,
      });
    }
    const existingMember = await Member.findOne({ email: email });
    if (existingMember) {
      return res.render("member/add-member", {
        title: "Add Member Page",
        error: "Member is already Exist.",
        edit: false,
        oldInput: req.body,
      });
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

    const member = new Member({
      name,
      uId: uid,
      email,
      memberType,
      membershipStatus,
    });
    const error = member.validateSync();

    if (error) {
      const errorMessages = [];

      for (const field in error.errors) {
        errorMessages.push(error.errors[field].message);
      }

      return res.render("member/add-member", {
        title: "Add Member Page",
        error: error,
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
    const memberDetails = await Member.find().sort({ uId: 1 });
    if (!member && !memberDetails) {
      return res.render("member/add-member", {
        title: "Edit Member Page",
        member: memberDetails,
        error: "Member is not Found..",
        edit: edit,
        oldInput: {},
      });
    }

    const oldInput = {
      name: member.name,
      email: member.email,
      memberType: member.memberType,
      membershipStatus: member.membershipStatus,
    };

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
      error: "Member is not Found..",
      edit: false,
      oldInput: {},
    });
  }
};

//  Edit member in DB
exports.postEditMember = async (req, res) => {
  try {
    const { name, email, memberType, membershipStatus } = req.body;

    const id = req.body.id;
    const allMembers = await Member.find().sort({ uId: 1 });
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("member/add-member", {
        title: "Edit Member Page",
        error: errors.array()[0].msg,
        member: allMembers,
        edit: true,
        oldInput: req.body,
      });
    }
    if (!name || !email || !memberType || !membershipStatus || !id) {
      return res.render("member/add-member", {
        title: "Edit Member Page",
        error: "All fields are required.",
        edit: true,
        member: allMembers,
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
            error:
              "Some books are not returned by user so user can't be inactive.",
            member: allMembers,
            edit: false,
            oldInput : req.body
          });
        }
      }
    }

    const updatedMember = await Member.findByIdAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { name, email, memberType, membershipStatus }
    );

    const existingMember = await Member.findOne({ email: email });

    if (!existingMember) {
      return res.render("member/member-details", {
        title: "Member Details Page",
        member: updatedMember,
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
    const currrecord = await Record.findOne({
      memberId: new mongoose.Types.ObjectId(id),
    });
    const deleteToMember = await Member.findById(id);
    const memberDetails = await Member.find().sort({ uId: 1 });
    if (currrecord) {
      for (let book of currrecord.book) {
        if (book.status !== "returned") {
          return res.render("member/member-details", {
            title: "Member Details Page",
            error: " Some books are not returned by member.",
            member: memberDetails,
            edit: false,
            oldInput : {}
          });
        }
      }
    }

    if (deleteToMember.membershipStatus == "active") {
      return res.render("member/member-details", {
        title: "Member Details Page",
        error: "Active members cannot deleted.",
        member: memberDetails,
        edit: false,
        oldInput: {},
      });
    }
    await Member.findByIdAndDelete(id);
    const deleteRecord = await Record.findOneAndDelete({
      memberId: new mongoose.Types.ObjectId(id),
    });
    res.redirect("/member/member-details");
  } catch (err) {
    console.log(err);
    return res.render("member/member-details", {
      title: "Member Details Page",
      error: "Something Went wrong...",
      member: await Member.find().sort({ uId: 1 }),
      edit: false,
    });
  }
};

exports.filterMember = async (req, res) => {
  try {
    const { filteruId, filterName, filterEmail, filterMemberType, filterMembershipStatus } = req.body;

    let filter = [];
    if (filteruId) {
      filter.push({ uId: { $regex: new RegExp(`${filteruId}`, "i") } });
    }
    if (filterName) {
      filter.push({ name: { $regex: new RegExp(`${filterName}`, "i") } });
    }

    if (filterEmail) {
      filter.push({ email: { $regex: new RegExp(`${filterEmail}`, "i") } });
    }

    if (filterMemberType) {
      filter.push({ memberType: filterMemberType });
    }

    if (filterMembershipStatus) {
      filter.push({
        membershipStatus: filterMembershipStatus,
      });
    }

    const findedMember = await Member.find(
      filter.length > 0 ? { $and: filter } : {}
    ).sort({ uId: 1 });

    res.render("member/member-details", {
      title: "Member Details Page",
      member: findedMember,
      error: null,
      oldInput: req.body,
    });
  } catch (error) {
    console.log(error);
    return res.render("member/member-details", {
      title: "member Details Page",
      member: await Member.find().sort({ uId: 1 }),
      error: error,
      oldInput: {},
    });
  }
};
