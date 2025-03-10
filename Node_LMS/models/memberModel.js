const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      minlength: [3, '{VALUE} have minimum 3 length.'],
      maxlength: [25, '{VALUE} have maximum 25 length'],
      required: true, 
    },
    email: {  
      type: String,
      trim: true,
      unique : true , 
      lowercase:true,
      minlength: [5, '{VALUE} have minimum 5 length.'],
      maxlength: [50, '{VALUE} have maximum 50 length'],
      required: true,
    },
    memberType: {
      type: String,
      required: true,
      enum: {
        values: ["student", "faculty", "guest"],
        message: `{VALUE} is not valid.`,
      },
    }, 
    membershipStatus: {
      type: String,
      enum: {
        values: ["active", "inactive"],
        message: `{VALUE} is not valid.`,
      },
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);
