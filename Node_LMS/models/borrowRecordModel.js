const mongoose = require("mongoose");
const cron = require("node-cron")
const borrowRecordSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    book:[ {

    bookId: { type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },

    issueDate: {
        type: Date,
        required: true,
      },
      dueDate: {
        type: Date,
        required: true,
  
      },
      status: {
        type: String,
        enum: {
          values :["returned", "borrowed", "delayed"],
          message : `{VALUE} is not valid.`
        },
        required: true,
      },
    },
   ],
   
   
  },
  { timestamps: true }
);
    



  
module.exports = mongoose.model("Record", borrowRecordSchema);
