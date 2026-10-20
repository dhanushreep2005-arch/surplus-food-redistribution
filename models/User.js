// models/User.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true, // stored as a bcrypt hash, never plain text
  },
  role: {
    type: String,
    required: true,
    enum: ["donor", "ngo", "volunteer"],
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  // Optional. Address strings stay the source of truth when these are absent.
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("validate", function (next) {
  const hasLat = this.lat !== undefined && this.lat !== null;
  const hasLng = this.lng !== undefined && this.lng !== null;
  if (hasLat !== hasLng) {
    return next(new Error("Latitude and longitude must both be set, or both omitted."));
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
