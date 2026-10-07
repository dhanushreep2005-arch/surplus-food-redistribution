// routes/pickupRoutes.js
const express = require("express");
const router = express.Router();
const pickupController = require("../controllers/pickupController");
const { isLoggedIn, checkRole } = require("../utils/middleware");

router.get("/", isLoggedIn, pickupController.index);
router.get("/new", checkRole("volunteer"), pickupController.renderNewForm);
router.post("/", checkRole("volunteer"), pickupController.createPickup);
router.get("/:id", isLoggedIn, pickupController.showPickup);

// PATCH /pickups/:id/accept -> Volunteer accepts an unassigned pickup
router.patch("/:id/accept", checkRole("volunteer"), pickupController.acceptPickup);

router.get("/:id/edit", checkRole("volunteer"), pickupController.renderEditForm);
router.put("/:id", checkRole("volunteer"), pickupController.updatePickup);
router.delete("/:id", checkRole("volunteer"), pickupController.deletePickup);

module.exports = router;
