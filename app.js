// app.js
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const methodOverride = require("method-override");

const { passUserToViews } = require("./utils/middleware");
const { getRemainingTime, getUrgencyLevel, getUrgencyBadgeClass } = require("./utils/urgency");

const userRoutes = require("./routes/userRoutes");
const donationRoutes = require("./routes/donationRoutes");
const requestRoutes = require("./routes/requestRoutes");
const pickupRoutes = require("./routes/pickupRoutes");

// ---------- DATABASE CONNECTION ----------
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/surplusfood";

async function main() {
  await mongoose.connect(MONGO_URL);
}

main()
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB connection error:", err));

// ---------- APP SETTINGS ----------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method")); // allows <form> to send PUT/PATCH/DELETE
app.use(express.static(path.join(__dirname, "public")));

// ---------- SESSION (simplest approach for login state, no JWT) ----------
app.use(
  session({
    secret: process.env.SESSION_SECRET || "surplusFoodSecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Make currentUser / flash messages available in every EJS view
app.use(passUserToViews);

// Make the rule-based urgency/expiry helper functions available in every EJS view
app.locals.getRemainingTime = getRemainingTime;
app.locals.getUrgencyLevel = getUrgencyLevel;
app.locals.getUrgencyBadgeClass = getUrgencyBadgeClass;

// ---------- ROUTES ----------
app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.use("/", userRoutes);
app.use("/donations", donationRoutes);
app.use("/requests", requestRoutes);
app.use("/pickups", pickupRoutes);

// ---------- 404 HANDLER ----------
app.use((req, res) => {
  res.status(404).send("Page not found");
});

// ---------- BASIC ERROR HANDLER ----------
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send("Something went wrong on the server.");
});

// ---------- START SERVER ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
