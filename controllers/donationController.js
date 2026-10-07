// controllers/donationController.js
const Donation = require("../models/Donation");
const Pickup = require("../models/Pickup");
const User = require("../models/User");
const { isExpired } = require("../utils/urgency");

// GET /donations  -> list all donations (any logged-in user can browse)
module.exports.index = async (req, res) => {
  // Auto-expire anything whose expiry time has passed before we display it
  await Donation.updateMany(
    { status: { $in: ["pending", "accepted"] }, expiryAt: { $lt: new Date() } },
    { status: "expired" }
  );

  const donations = await Donation.find({})
    .populate("donor")
    .populate("ngo")
    .populate("volunteer")
    .sort({ createdAt: -1 });

  res.render("donations/index.ejs", { donations });
};

// GET /donations/new
module.exports.renderNewForm = (req, res) => {
  res.render("donations/new.ejs");
};

// POST /donations
module.exports.createDonation = async (req, res) => {
  try {
    const donorId = req.session.currentUser._id;

    const newDonation = new Donation({
      foodName: req.body.foodName,
      foodType: req.body.foodType,
      quantity: req.body.quantity,
      unit: req.body.unit,
      preparedAt: req.body.preparedAt,
      expiryAt: req.body.expiryAt,
      location: req.body.location,
      description: req.body.description,
      donor: donorId,
      status: "pending",
    });

    await newDonation.save();
    req.session.successMsg = "Food donation posted successfully!";
    res.redirect(`/donations/${newDonation._id}`);
  } catch (err) {
    console.log(err);
    req.session.errorMsg = "Could not create donation. Please check the form.";
    res.redirect("/donations/new");
  }
};

// GET /donations/:id
module.exports.showDonation = async (req, res) => {
  const { id } = req.params;
  const donation = await Donation.findById(id)
    .populate("donor")
    .populate("ngo")
    .populate("volunteer");

  if (!donation) {
    req.session.errorMsg = "Donation not found.";
    return res.redirect("/donations");
  }

  // Auto-expire if the time has passed and it's still pending/accepted
  if (isExpired(donation.expiryAt) && !["delivered", "expired"].includes(donation.status)) {
    donation.status = "expired";
    await donation.save();
  }

  res.render("donations/show.ejs", { donation });
};

// GET /donations/:id/edit
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const donation = await Donation.findById(id);

  if (!donation) {
    req.session.errorMsg = "Donation not found.";
    return res.redirect("/donations");
  }

  // Ownership check: a donor may only edit their OWN donations.
  // This must be enforced here on the backend, not just by hiding the
  // button in EJS, otherwise anyone could hit this URL directly.
  if (String(donation.donor) !== String(req.session.currentUser._id)) {
    req.session.errorMsg = "Access denied. You can only edit your own donations.";
    return res.redirect("/donations");
  }

  res.render("donations/edit.ejs", { donation });
};

// PUT /donations/:id
module.exports.updateDonation = async (req, res) => {
  const { id } = req.params;
  const donation = await Donation.findById(id);

  if (!donation) {
    req.session.errorMsg = "Donation not found.";
    return res.redirect("/donations");
  }

  // Ownership check (backend-enforced, see renderEditForm above)
  if (String(donation.donor) !== String(req.session.currentUser._id)) {
    req.session.errorMsg = "Access denied. You can only edit your own donations.";
    return res.redirect("/donations");
  }

  await Donation.findByIdAndUpdate(id, {
    foodName: req.body.foodName,
    foodType: req.body.foodType,
    quantity: req.body.quantity,
    unit: req.body.unit,
    preparedAt: req.body.preparedAt,
    expiryAt: req.body.expiryAt,
    location: req.body.location,
    description: req.body.description,
  });

  req.session.successMsg = "Donation updated successfully.";
  res.redirect(`/donations/${id}`);
};

// DELETE /donations/:id
module.exports.deleteDonation = async (req, res) => {
  const { id } = req.params;
  const donation = await Donation.findById(id);

  if (!donation) {
    req.session.errorMsg = "Donation not found.";
    return res.redirect("/donations");
  }

  // Ownership check (backend-enforced, see renderEditForm above)
  if (String(donation.donor) !== String(req.session.currentUser._id)) {
    req.session.errorMsg = "Access denied. You can only delete your own donations.";
    return res.redirect("/donations");
  }

  await Donation.findByIdAndDelete(id);
  req.session.successMsg = "Donation deleted.";
  res.redirect("/donations");
};

// PATCH /donations/:id/accept  -> NGO accepts a pending donation
module.exports.acceptDonation = async (req, res) => {
  const { id } = req.params;
  const ngoId = req.session.currentUser._id;

  const donation = await Donation.findById(id);
  if (!donation) {
    req.session.errorMsg = "Donation not found.";
    return res.redirect("/ngo/dashboard");
  }

  // An expired donation must never be accepted, even if this route is
  // hit directly (defence in depth on top of hiding the button in EJS)
  if (isExpired(donation.expiryAt)) {
    donation.status = "expired";
    await donation.save();
    req.session.errorMsg = "This donation has expired and can no longer be accepted.";
    return res.redirect("/ngo/dashboard");
  }

  if (donation.status !== "pending") {
    req.session.errorMsg = "This donation has already been accepted.";
    return res.redirect("/ngo/dashboard");
  }

  donation.status = "accepted";
  donation.ngo = ngoId;
  await donation.save();

  // Create the corresponding Pickup record now that the donation has been
  // accepted, so the Pickup model is connected to the live workflow from
  // this point on. No volunteer is assigned yet — any available volunteer
  // can "Accept Pickup" from their dashboard. Guard against duplicates in
  // case this route is somehow hit twice for the same donation.
  const existingPickup = await Pickup.findOne({ donation: donation._id });
  if (!existingPickup) {
    const ngoUser = await User.findById(ngoId);
    await Pickup.create({
      donation: donation._id,
      volunteer: null,
      pickupLocation: donation.location,
      deliveryLocation: ngoUser ? ngoUser.address : "NGO",
      pickupTime: null,
      status: "pending",
    });
  }

  req.session.successMsg = "Donation accepted successfully!";
  res.redirect("/ngo/dashboard");
};

// PATCH /donations/:id/pickup -> Volunteer marks food as picked up
module.exports.markPickedUp = async (req, res) => {
  const { id } = req.params;
  const volunteerId = req.session.currentUser._id;

  const donation = await Donation.findById(id);
  if (!donation) {
    req.session.errorMsg = "Donation not found.";
    return res.redirect("/volunteer/dashboard");
  }

  if (donation.status !== "accepted") {
    req.session.errorMsg = "This donation is not ready for pickup.";
    return res.redirect("/volunteer/dashboard");
  }

  // Only the volunteer who accepted this pickup may mark it picked up.
  // (They accept the pickup first via "Accept Pickup" on their dashboard,
  // which sets donation.volunteer — see pickupController.acceptPickup.)
  if (!donation.volunteer || String(donation.volunteer) !== String(volunteerId)) {
    req.session.errorMsg = "Access denied. You must accept this pickup first.";
    return res.redirect("/volunteer/dashboard");
  }

  donation.status = "picked_up";
  await donation.save();

  // Keep the Pickup record in sync with the Donation status, so the two
  // never disagree.
  await Pickup.findOneAndUpdate(
    { donation: donation._id, volunteer: volunteerId },
    { status: "picked_up", pickupTime: new Date() }
  );

  req.session.successMsg = "Marked as picked up!";
  res.redirect("/volunteer/dashboard");
};

// PATCH /donations/:id/deliver -> Volunteer marks food as delivered
module.exports.markDelivered = async (req, res) => {
  const { id } = req.params;
  const volunteerId = req.session.currentUser._id;

  const donation = await Donation.findById(id);
  if (!donation) {
    req.session.errorMsg = "Donation not found.";
    return res.redirect("/volunteer/dashboard");
  }

  if (String(donation.volunteer) !== String(volunteerId)) {
    req.session.errorMsg = "Access denied.";
    return res.redirect("/volunteer/dashboard");
  }

  donation.status = "delivered";
  await donation.save();

  // Keep the Pickup record in sync with the Donation status
  await Pickup.findOneAndUpdate(
    { donation: donation._id, volunteer: volunteerId },
    { status: "delivered" }
  );

  req.session.successMsg = "Delivery marked complete!";
  res.redirect("/volunteer/dashboard");
};
