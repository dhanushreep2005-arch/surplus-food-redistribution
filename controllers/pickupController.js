// controllers/pickupController.js
const Pickup = require("../models/Pickup");
const Donation = require("../models/Donation");

// GET /pickups
module.exports.index = async (req, res) => {
  let pickups;

  if (req.session.currentUser.role === "volunteer") {
    pickups = await Pickup.find({ volunteer: req.session.currentUser._id })
      .populate("donation")
      .populate("volunteer")
      .sort({ createdAt: -1 });
  } else {
    pickups = await Pickup.find({})
      .populate("donation")
      .populate("volunteer")
      .sort({ createdAt: -1 });
  }

  res.render("pickups/index.ejs", { pickups });
};

// GET /pickups/new
// Note: Pickup records are now created automatically when an NGO accepts a
// donation (see donationController.acceptDonation). This form only remains
// as a fallback for the rare case where an accepted donation somehow has no
// Pickup record yet (e.g. legacy data) — it will not create duplicates.
module.exports.renderNewForm = async (req, res) => {
  const accepted = await Donation.find({ status: "accepted" });
  const existingPickups = await Pickup.find({ donation: { $in: accepted.map((d) => d._id) } });
  const donationsWithPickup = new Set(existingPickups.map((p) => String(p.donation)));
  const donations = accepted.filter((d) => !donationsWithPickup.has(String(d._id)));

  res.render("pickups/new.ejs", { donations });
};

// POST /pickups
module.exports.createPickup = async (req, res) => {
  try {
    const donation = await Donation.findById(req.body.donation);
    if (!donation) {
      req.session.errorMsg = "Donation not found.";
      return res.redirect("/pickups/new");
    }

    // Guard against duplicates: if a Pickup already exists for this
    // donation, just attach this volunteer to it instead of making a new one.
    let pickup = await Pickup.findOne({ donation: donation._id });
    if (pickup) {
      pickup.volunteer = req.session.currentUser._id;
      pickup.status = "accepted";
      await pickup.save();
    } else {
      pickup = await Pickup.create({
        donation: donation._id,
        volunteer: req.session.currentUser._id,
        pickupLocation: req.body.pickupLocation,
        deliveryLocation: req.body.deliveryLocation,
        status: "accepted",
      });
    }

    // Also link this volunteer to the donation itself
    donation.volunteer = req.session.currentUser._id;
    await donation.save();

    req.session.successMsg = "Pickup task created!";
    res.redirect(`/pickups/${pickup._id}`);
  } catch (err) {
    console.log(err);
    req.session.errorMsg = "Could not create pickup.";
    res.redirect("/pickups/new");
  }
};

// PATCH /pickups/:id/accept -> Volunteer accepts an unassigned pickup
module.exports.acceptPickup = async (req, res) => {
  const { id } = req.params;
  const volunteerId = req.session.currentUser._id;

  const pickup = await Pickup.findById(id);
  if (!pickup) {
    req.session.errorMsg = "Pickup not found.";
    return res.redirect("/volunteer/dashboard");
  }

  if (pickup.volunteer) {
    req.session.errorMsg = "This pickup has already been accepted by another volunteer.";
    return res.redirect("/volunteer/dashboard");
  }

  pickup.volunteer = volunteerId;
  pickup.status = "accepted";
  await pickup.save();

  // Link the volunteer to the donation too, so Donation stays the single
  // source of truth for the overall food status while Pickup tracks the
  // pickup/delivery stage. Donation.status remains "accepted" until the
  // volunteer physically marks it picked up.
  const donation = await Donation.findById(pickup.donation);
  if (donation) {
    donation.volunteer = volunteerId;
    await donation.save();
  }

  req.session.successMsg = "Pickup accepted! Head to the pickup location when ready.";
  res.redirect("/volunteer/dashboard");
};

// GET /pickups/:id
module.exports.showPickup = async (req, res) => {
  const { id } = req.params;
  const pickup = await Pickup.findById(id).populate("donation").populate("volunteer");

  if (!pickup) {
    req.session.errorMsg = "Pickup not found.";
    return res.redirect("/pickups");
  }

  res.render("pickups/show.ejs", { pickup });
};

// GET /pickups/:id/edit
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const pickup = await Pickup.findById(id).populate("donation");

  if (!pickup) {
    req.session.errorMsg = "Pickup not found.";
    return res.redirect("/pickups");
  }

  res.render("pickups/edit.ejs", { pickup });
};

// PUT /pickups/:id
module.exports.updatePickup = async (req, res) => {
  const { id } = req.params;
  const pickup = await Pickup.findById(id);

  if (!pickup) {
    req.session.errorMsg = "Pickup not found.";
    return res.redirect("/pickups");
  }

  await Pickup.findByIdAndUpdate(id, {
    pickupLocation: req.body.pickupLocation,
    deliveryLocation: req.body.deliveryLocation,
  });

  req.session.successMsg = "Pickup updated.";
  res.redirect(`/pickups/${id}`);
};

// DELETE /pickups/:id
module.exports.deletePickup = async (req, res) => {
  const { id } = req.params;
  const pickup = await Pickup.findById(id);

  if (!pickup) {
    req.session.errorMsg = "Pickup not found.";
    return res.redirect("/pickups");
  }

  await Pickup.findByIdAndDelete(id);
  req.session.successMsg = "Pickup deleted.";
  res.redirect("/pickups");
};
