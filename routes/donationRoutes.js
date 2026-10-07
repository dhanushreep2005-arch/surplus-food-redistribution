// routes/donationRoutes.js
const express = require("express");
const router = express.Router();
const donationController = require("../controllers/donationController");
const { isLoggedIn, checkRole } = require("../utils/middleware");

// GET /donations -> list all donations (any logged-in user can browse)
router.get("/", isLoggedIn, donationController.index);

// GET /donations/new -> only donors can post food
router.get("/new", checkRole("donor"), donationController.renderNewForm);

// POST /donations -> only donors can create
router.post("/", checkRole("donor"), donationController.createDonation);

// GET /donations/:id -> view single donation
router.get("/:id", isLoggedIn, donationController.showDonation);

// GET /donations/:id/edit -> only donor can edit their own donation form
router.get("/:id/edit", checkRole("donor"), donationController.renderEditForm);

// PUT /donations/:id -> update donation
router.put("/:id", checkRole("donor"), donationController.updateDonation);

// DELETE /donations/:id -> delete donation
router.delete("/:id", checkRole("donor"), donationController.deleteDonation);

// PATCH /donations/:id/accept -> NGO accepts a pending donation
router.patch("/:id/accept", checkRole("ngo"), donationController.acceptDonation);

// PATCH /donations/:id/pickup -> Volunteer marks picked up
router.patch("/:id/pickup", checkRole("volunteer"), donationController.markPickedUp);

// PATCH /donations/:id/deliver -> Volunteer marks delivered
router.patch("/:id/deliver", checkRole("volunteer"), donationController.markDelivered);

module.exports = router;
