// models/Donation.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const donationSchema = new Schema({
  foodName: {
    type: String,
    required: true,
    trim: true,
  },
  foodType: {
    type: String,
    required: true,
    enum: ["Veg", "Non-Veg", "Bakery", "Packaged", "Other"],
  },
  quantity: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
    enum: ["packets", "kg", "pieces", "plates", "litres"],
  },
  preparedAt: {
    type: Date,
    required: true,
  },
  expiryAt: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  // The one central status every dashboard reads from
  status: {
    type: String,
    enum: ["pending", "accepted", "picked_up", "delivered", "expired"],
    default: "pending",
  },
  donor: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ngo: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  volunteer: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Donation", donationSchema);
