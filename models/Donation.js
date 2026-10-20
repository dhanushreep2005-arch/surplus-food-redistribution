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
    min: [1, "Quantity must be at least 1."],
  },
  // Unallocated amount. New donations start equal to quantity.
  remainingQuantity: {
    type: Number,
    min: [0, "Remaining quantity cannot be negative."],
    default: function () {
      return this.quantity;
    },
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
  // Optional pickup coordinates. Location text is preserved even when these are absent.
  lat: {
    type: Number,
    min: [-90, "Latitude must be between -90 and 90."],
    max: [90, "Latitude must be between -90 and 90."],
    default: undefined,
  },
  lng: {
    type: Number,
    min: [-180, "Longitude must be between -180 and 180."],
    max: [180, "Longitude must be between -180 and 180."],
    default: undefined,
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

donationSchema.pre("validate", function (next) {
  const hasLat = this.lat !== undefined && this.lat !== null;
  const hasLng = this.lng !== undefined && this.lng !== null;
  if (hasLat !== hasLng) {
    return next(new Error("Latitude and longitude must both be set, or both omitted."));
  }

  if (this.quantity != null && (this.remainingQuantity === undefined || this.remainingQuantity === null)) {
    this.remainingQuantity = this.quantity;
  }

  if (this.remainingQuantity != null && this.remainingQuantity < 0) {
    this.remainingQuantity = 0;
  }

  if (this.quantity != null && this.remainingQuantity != null && this.remainingQuantity > this.quantity) {
    this.remainingQuantity = this.quantity;
  }

  next();
});

donationSchema.methods.getRemainingQuantity = function () {
  if (this.remainingQuantity === undefined || this.remainingQuantity === null) {
    return this.quantity;
  }
  return this.remainingQuantity;
};

module.exports = mongoose.model("Donation", donationSchema);
