const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true, 
    },
    uId : {
      type : String ,
      require : true
    },
    email: {  
      type: String,
      trim: true,
      lowercase:true,
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
