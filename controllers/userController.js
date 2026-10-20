// controllers/userController.js
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Donation = require("../models/Donation");
const Pickup = require("../models/Pickup");
const { parseOptionalLatLng } = require("../utils/coordinates");

// GET /register
module.exports.renderRegisterForm = (req, res) => {
  res.render("auth/register.ejs");
};

// POST /register
module.exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      req.session.errorMsg = "An account with this email already exists.";
      return res.redirect("/register");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const parsedCoords = parseOptionalLatLng(req.body.lat, req.body.lng);
    if (parsedCoords.error) {
      req.session.errorMsg = parsedCoords.error;
      return res.redirect("/register");
    }

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      address,
    });

    if (parsedCoords.coords) {
      newUser.lat = parsedCoords.coords.lat;
      newUser.lng = parsedCoords.coords.lng;
    }

    await newUser.save();

    req.session.successMsg = "Registration successful! Please log in.";
    res.redirect("/login");
  } catch (err) {
    console.log(err);
    req.session.errorMsg = "Something went wrong during registration.";
    res.redirect("/register");
  }
};

// GET /login
module.exports.renderLoginForm = (req, res) => {
  res.render("auth/login.ejs");
};

// POST /login
module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      req.session.errorMsg = "Invalid email or password.";
      return res.redirect("/login");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.session.errorMsg = "Invalid email or password.";
      return res.redirect("/login");
    }

    // Store a small, safe version of the user in the session
    req.session.currentUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    req.session.successMsg = `Welcome back, ${user.name}!`;

    // Redirect based on role
    if (user.role === "donor") return res.redirect("/donor/dashboard");
    if (user.role === "ngo") return res.redirect("/ngo/dashboard");
    if (user.role === "volunteer") return res.redirect("/volunteer/dashboard");

    res.redirect("/");
  } catch (err) {
    console.log(err);
    req.session.errorMsg = "Something went wrong during login.";
    res.redirect("/login");
  }
};

// GET /logout
module.exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};

// GET /donor/dashboard
module.exports.donorDashboard = async (req, res) => {
  const donorId = req.session.currentUser._id;

  // Auto-expire before displaying (see ngoDashboard for the full explanation)
  await Donation.updateMany(
    { status: { $in: ["pending", "accepted"] }, expiryAt: { $lt: new Date() } },
    { status: "expired" }
  );

  const donations = await Donation.find({ donor: donorId }).sort({ createdAt: -1 });

  const stats = {
    total: donations.length,
    pending: donations.filter((d) => d.status === "pending").length,
    accepted: donations.filter((d) => d.status === "accepted").length,
    picked_up: donations.filter((d) => d.status === "picked_up").length,
    delivered: donations.filter((d) => d.status === "delivered").length,
  };

  res.render("donor/dashboard.ejs", { donations, stats });
};

// GET /donor/profile
module.exports.donorProfile = async (req, res) => {
  const user = await User.findById(req.session.currentUser._id);
  res.render("donor/profile.ejs", { user });
};

// GET /ngo/dashboard
module.exports.ngoDashboard = async (req, res) => {
  const ngoId = req.session.currentUser._id;

  // Auto-expire any pending/accepted donation whose expiry time has passed
  // BEFORE we query, so an NGO never sees an "Accept Food" button for
  // food that is no longer safe to distribute.
  await Donation.updateMany(
    { status: { $in: ["pending", "accepted"] }, expiryAt: { $lt: new Date() } },
    { status: "expired" }
  );

  const availableDonations = await Donation.find({ status: "pending" })
    .populate("donor")
    .sort({ expiryAt: 1 });

  const acceptedDonations = await Donation.find({ ngo: ngoId, status: { $in: ["accepted", "picked_up"] } })
    .populate("donor")
    .populate("volunteer")
    .sort({ createdAt: -1 });

  const receivedDonations = await Donation.find({ ngo: ngoId, status: "delivered" })
    .populate("donor")
    .populate("volunteer")
    .sort({ createdAt: -1 });

  res.render("ngo/dashboard.ejs", { availableDonations, acceptedDonations, receivedDonations });
};

// GET /ngo/profile
module.exports.ngoProfile = async (req, res) => {
  const user = await User.findById(req.session.currentUser._id);
  res.render("ngo/profile.ejs", { user });
};

// GET /volunteer/dashboard
module.exports.volunteerDashboard = async (req, res) => {
  const volunteerId = req.session.currentUser._id;

  // Auto-expire before displaying (see ngoDashboard for the full explanation)
  await Donation.updateMany(
    { status: { $in: ["pending", "accepted"] }, expiryAt: { $lt: new Date() } },
    { status: "expired" }
  );

  // Available Pickups = accepted by an NGO, Pickup record exists, but no
  // volunteer has accepted it yet
  const availablePickups = await Pickup.find({ status: "pending", volunteer: null })
    .populate({ path: "donation", populate: [{ path: "donor" }, { path: "ngo" }] })
    .sort({ createdAt: 1 });

  // Assigned to me, but not yet physically picked up
  const myAssignedPickups = await Pickup.find({ volunteer: volunteerId, status: "accepted" })
    .populate({ path: "donation", populate: [{ path: "donor" }, { path: "ngo" }] })
    .sort({ createdAt: 1 });

  const activePickups = await Pickup.find({ volunteer: volunteerId, status: "picked_up" })
    .populate({ path: "donation", populate: [{ path: "donor" }, { path: "ngo" }] })
    .sort({ createdAt: -1 });

  const completedDeliveries = await Pickup.find({ volunteer: volunteerId, status: "delivered" })
    .populate({ path: "donation", populate: [{ path: "donor" }, { path: "ngo" }] })
    .sort({ createdAt: -1 });

  res.render("volunteer/dashboard.ejs", {
    availablePickups,
    myAssignedPickups,
    activePickups,
    completedDeliveries,
  });
};

// GET /volunteer/profile
module.exports.volunteerProfile = async (req, res) => {
  const user = await User.findById(req.session.currentUser._id);
  res.render("volunteer/profile.ejs", { user });
};
