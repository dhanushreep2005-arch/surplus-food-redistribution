// routes/requestRoutes.js
const express = require("express");
const router = express.Router();
const requestController = require("../controllers/requestController");
const { isLoggedIn, checkRole } = require("../utils/middleware");

router.get("/", isLoggedIn, requestController.index);
router.get("/new", checkRole("ngo"), requestController.renderNewForm);
router.post("/", checkRole("ngo"), requestController.createRequest);
router.get("/:id", isLoggedIn, requestController.showRequest);
router.get("/:id/edit", checkRole("ngo"), requestController.renderEditForm);
router.put("/:id", checkRole("ngo"), requestController.updateRequest);
router.delete("/:id", checkRole("ngo"), requestController.deleteRequest);

module.exports = router;
