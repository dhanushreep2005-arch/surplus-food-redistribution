// models/Pickup.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pickupSchema = new Schema({
  donation: {
    type: Schema.Types.ObjectId,
    ref: "Donation",
    required: true,
  },
  volunteer: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  pickupLocation: {
    type: String,
    required: true,
  },
  deliveryLocation: {
    type: String,
    required: true,
  },
  pickupTime: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "picked_up", "delivered"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Pickup", pickupSchema);
