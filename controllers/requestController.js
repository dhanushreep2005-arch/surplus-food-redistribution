// controllers/requestController.js
const Request = require("../models/Request");
const Donation = require("../models/Donation");

// GET /requests
module.exports.index = async (req, res) => {
  let requests;

  if (req.session.currentUser.role === "ngo") {
    // NGOs only see their own requests
    requests = await Request.find({ ngo: req.session.currentUser._id })
      .populate("donation")
      .populate("ngo")
      .sort({ createdAt: -1 });
  } else {
    requests = await Request.find({})
      .populate("donation")
      .populate("ngo")
      .sort({ createdAt: -1 });
  }

  res.render("requests/index.ejs", { requests });
};

// GET /requests/new
module.exports.renderNewForm = async (req, res) => {
  const donations = await Donation.find({ status: "pending" });
  res.render("requests/new.ejs", { donations });
};

// POST /requests
module.exports.createRequest = async (req, res) => {
  try {
    const newRequest = new Request({
      donation: req.body.donation,
      ngo: req.session.currentUser._id,
      quantityRequested: req.body.quantityRequested,
      message: req.body.message,
      status: "pending",
    });

    await newRequest.save();
    req.session.successMsg = "Request submitted successfully!";
    res.redirect(`/requests/${newRequest._id}`);
  } catch (err) {
    console.log(err);
    req.session.errorMsg = "Could not submit request.";
    res.redirect("/requests/new");
  }
};

// GET /requests/:id
module.exports.showRequest = async (req, res) => {
  const { id } = req.params;
  const request = await Request.findById(id).populate("donation").populate("ngo");

  if (!request) {
    req.session.errorMsg = "Request not found.";
    return res.redirect("/requests");
  }

  res.render("requests/show.ejs", { request });
};

// GET /requests/:id/edit
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const request = await Request.findById(id).populate("donation");

  if (!request) {
    req.session.errorMsg = "Request not found.";
    return res.redirect("/requests");
  }

  res.render("requests/edit.ejs", { request });
};

// PUT /requests/:id
module.exports.updateRequest = async (req, res) => {
  const { id } = req.params;
  const request = await Request.findById(id);

  if (!request) {
    req.session.errorMsg = "Request not found.";
    return res.redirect("/requests");
  }

  await Request.findByIdAndUpdate(id, {
    quantityRequested: req.body.quantityRequested,
    message: req.body.message,
  });

  req.session.successMsg = "Request updated.";
  res.redirect(`/requests/${id}`);
};

// DELETE /requests/:id
module.exports.deleteRequest = async (req, res) => {
  const { id } = req.params;
  const request = await Request.findById(id);

  if (!request) {
    req.session.errorMsg = "Request not found.";
    return res.redirect("/requests");
  }

  await Request.findByIdAndDelete(id);
  req.session.successMsg = "Request deleted.";
  res.redirect("/requests");
};
