const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Minimum One Book is required. you entered: {VALUE}"],
    },
    availableQuantity: {
      type: Number,
      default: 0,
    },
    borrowedQuantity: {
      type: Number,
      default: 0,
    },
    maintenanceQuantity: {
      type: Number,
      default: 0,
    },

    publicationDate: {
      type: Date,
      required: true,
      max: [
        new Date().toISOString().split("T")[0],
        `{VALUE} : future Date cannot be publication Date .`,
      ],
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["available", "borrowed", "maintenance"],
        message: "{VALUE} is not Valid.",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
