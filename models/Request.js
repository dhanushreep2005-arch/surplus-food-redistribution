// models/Request.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const requestSchema = new Schema({
  donation: {
    type: Schema.Types.ObjectId,
    ref: "Donation",
    required: true,
  },
  ngo: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  quantityRequested: {
    type: Number,
    required: true,
  },
  message: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Request", requestSchema);
