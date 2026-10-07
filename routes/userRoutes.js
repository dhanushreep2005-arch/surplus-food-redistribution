// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { checkRole } = require("../utils/middleware");

// Auth routes
router.get("/register", userController.renderRegisterForm);
router.post("/register", userController.register);

router.get("/login", userController.renderLoginForm);
router.post("/login", userController.login);

router.get("/logout", userController.logout);

// Donor routes
router.get("/donor/dashboard", checkRole("donor"), userController.donorDashboard);
router.get("/donor/profile", checkRole("donor"), userController.donorProfile);

// NGO routes
router.get("/ngo/dashboard", checkRole("ngo"), userController.ngoDashboard);
router.get("/ngo/profile", checkRole("ngo"), userController.ngoProfile);

// Volunteer routes
router.get("/volunteer/dashboard", checkRole("volunteer"), userController.volunteerDashboard);
router.get("/volunteer/profile", checkRole("volunteer"), userController.volunteerProfile);

module.exports = router;
