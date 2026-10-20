// init/data.js
//
// Run this with: node init/data.js
// It clears existing data and inserts fresh, realistic sample data so the
// app never opens with an empty database. Passwords for ALL seeded users
// are: password123

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Donation = require("../models/Donation");
const Request = require("../models/Request");
const Pickup = require("../models/Pickup");

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/surplusfood";

async function seedDatabase() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to MongoDB for seeding...");

  // Clear existing data
  await User.deleteMany({});
  await Donation.deleteMany({});
  await Request.deleteMany({});
  await Pickup.deleteMany({});
  console.log("Old data cleared.");

  const hashedPassword = await bcrypt.hash("password123", 10);

  // SAMPLE coordinates are labelled demo locality centroids for Bengaluru only.
  // They are not surveyed GPS of a real building. Mysuru and Mangaluru records
  // keep address strings and are left without coordinates.
  const SAMPLE = {
    MG_ROAD: { lat: 12.9756, lng: 77.6066 }, // SAMPLE: MG Road, Bengaluru
    INDIRANAGAR: { lat: 12.9784, lng: 77.6408 }, // SAMPLE: Indiranagar, Bengaluru
    JAYANAGAR: { lat: 12.925, lng: 77.5938 }, // SAMPLE: Jayanagar, Bengaluru
    BASAVANAGUDI: { lat: 12.9422, lng: 77.5736 }, // SAMPLE: Basavanagudi, Bengaluru
    KORAMANGALA: { lat: 12.9352, lng: 77.6245 }, // SAMPLE: Koramangala, Bengaluru
    HSR_LAYOUT: { lat: 12.9121, lng: 77.6446 }, // SAMPLE: HSR Layout, Bengaluru
    VIDYARANYAPURA: { lat: 13.0765, lng: 77.5577 }, // SAMPLE: Vidyaranyapura, Bengaluru
  };

  // ---------------- USERS ----------------
  const donors = await User.insertMany([
    {
      name: "Ramesh Gowda",
      email: "ramesh.gowda@example.com",
      password: hashedPassword,
      role: "donor",
      phone: "9845012345",
      address: "MG Road, Bengaluru, Karnataka",
      lat: SAMPLE.MG_ROAD.lat,
      lng: SAMPLE.MG_ROAD.lng,
    },
    {
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      password: hashedPassword,
      role: "donor",
      phone: "9845098765",
      address: "Indiranagar, Bengaluru, Karnataka",
      lat: SAMPLE.INDIRANAGAR.lat,
      lng: SAMPLE.INDIRANAGAR.lng,
    },
    {
      name: "Suresh Iyer",
      email: "suresh.iyer@example.com",
      password: hashedPassword,
      role: "donor",
      phone: "9845011122",
      address: "Vijayanagar, Mysuru, Karnataka",
    },
  ]);

  const ngos = await User.insertMany([
    {
      name: "Akshaya Seva Foundation",
      email: "contact@akshayaseva.org",
      password: hashedPassword,
      role: "ngo",
      phone: "8023456789",
      address: "Jayanagar, Bengaluru, Karnataka",
      lat: SAMPLE.JAYANAGAR.lat,
      lng: SAMPLE.JAYANAGAR.lng,
    },
    {
      name: "Annapurna Trust",
      email: "info@annapurnatrust.org",
      password: hashedPassword,
      role: "ngo",
      phone: "8023456790",
      address: "Basavanagudi, Bengaluru, Karnataka",
      lat: SAMPLE.BASAVANAGUDI.lat,
      lng: SAMPLE.BASAVANAGUDI.lng,
    },
    {
      name: "Sneha Sadan NGO",
      email: "reach@snehasadan.org",
      password: hashedPassword,
      role: "ngo",
      phone: "8212345678",
      address: "Kadri, Mangaluru, Karnataka",
    },
  ]);

  const volunteers = await User.insertMany([
    {
      name: "Arjun Nair",
      email: "arjun.nair@example.com",
      password: hashedPassword,
      role: "volunteer",
      phone: "7845012345",
      address: "Koramangala, Bengaluru, Karnataka",
      lat: SAMPLE.KORAMANGALA.lat,
      lng: SAMPLE.KORAMANGALA.lng,
    },
    {
      name: "Divya Reddy",
      email: "divya.reddy@example.com",
      password: hashedPassword,
      role: "volunteer",
      phone: "7845067890",
      address: "HSR Layout, Bengaluru, Karnataka",
      lat: SAMPLE.HSR_LAYOUT.lat,
      lng: SAMPLE.HSR_LAYOUT.lng,
    },
    {
      name: "Kiran Kumar",
      email: "kiran.kumar@example.com",
      password: hashedPassword,
      role: "volunteer",
      phone: "7845011223",
      address: "Vidyaranyapura, Bengaluru, Karnataka",
      lat: SAMPLE.VIDYARANYAPURA.lat,
      lng: SAMPLE.VIDYARANYAPURA.lng,
    },
    {
      name: "Meera Pillai",
      email: "meera.pillai@example.com",
      password: hashedPassword,
      role: "volunteer",
      phone: "7845099887",
      address: "Kuvempunagar, Mysuru, Karnataka",
    },
  ]);

  console.log("Users seeded:", donors.length + ngos.length + volunteers.length);

  // ---------------- HELPER: build a date offset from now in hours ----------------
  function hoursFromNow(hours) {
    return new Date(Date.now() + hours * 60 * 60 * 1000);
  }
  function hoursAgo(hours) {
    return new Date(Date.now() - hours * 60 * 60 * 1000);
  }

  // ---------------- DONATIONS ----------------
  const donationData = [
    {
      foodName: "Vegetable Rice",
      foodType: "Veg",
      quantity: 50,
      unit: "packets",
      preparedAt: hoursAgo(1),
      expiryAt: hoursFromNow(1.5),
      location: "MG Road, Bengaluru",
      description: "Freshly cooked vegetable rice from a corporate event.",
      donor: donors[0]._id,
      status: "pending",
    },
    {
      foodName: "Chapati",
      foodType: "Veg",
      quantity: 100,
      unit: "pieces",
      preparedAt: hoursAgo(2),
      expiryAt: hoursFromNow(5),
      location: "Vijayanagar, Mysuru",
      description: "Soft chapatis, surplus from a wedding function.",
      donor: donors[2]._id,
      status: "pending",
    },
    {
      foodName: "Idli",
      foodType: "Veg",
      quantity: 80,
      unit: "pieces",
      preparedAt: hoursAgo(1),
      expiryAt: hoursFromNow(0.5),
      location: "Indiranagar, Bengaluru",
      description: "Steamed idlis from a breakfast catering order.",
      donor: donors[1]._id,
      status: "pending",
    },
    {
      foodName: "Lemon Rice",
      foodType: "Veg",
      quantity: 60,
      unit: "packets",
      preparedAt: hoursAgo(3),
      expiryAt: hoursFromNow(8),
      location: "Kadri, Mangaluru",
      description: "Lemon rice packed in disposable containers.",
      donor: donors[2]._id,
      status: "pending",
    },
    {
      foodName: "Vegetable Biryani",
      foodType: "Veg",
      quantity: 40,
      unit: "packets",
      preparedAt: hoursAgo(2),
      expiryAt: hoursFromNow(3),
      location: "MG Road, Bengaluru",
      description: "Aromatic veg biryani from a college fest.",
      donor: donors[0]._id,
      status: "accepted",
      ngo: ngos[0]._id,
    },
    {
      foodName: "Sambar Rice",
      foodType: "Veg",
      quantity: 70,
      unit: "packets",
      preparedAt: hoursAgo(4),
      expiryAt: hoursFromNow(6),
      location: "Basavanagudi, Bengaluru",
      description: "Sambar rice from a temple annadanam program.",
      donor: donors[1]._id,
      status: "accepted",
      ngo: ngos[1]._id,
    },
    {
      foodName: "Poori Masala",
      foodType: "Veg",
      quantity: 45,
      unit: "plates",
      preparedAt: hoursAgo(3),
      expiryAt: hoursFromNow(4),
      location: "Jayanagar, Bengaluru",
      description: "Poori with potato masala from a birthday party.",
      donor: donors[0]._id,
      status: "accepted",
      ngo: ngos[0]._id,
      volunteer: volunteers[0]._id,
    },
    {
      foodName: "Chicken Biryani",
      foodType: "Non-Veg",
      quantity: 30,
      unit: "packets",
      preparedAt: hoursAgo(2),
      expiryAt: hoursFromNow(5),
      location: "HSR Layout, Bengaluru",
      description: "Chicken biryani from a corporate lunch, packed hygienically.",
      donor: donors[1]._id,
      status: "picked_up",
      ngo: ngos[1]._id,
      volunteer: volunteers[1]._id,
    },
    {
      foodName: "Curd Rice",
      foodType: "Veg",
      quantity: 55,
      unit: "packets",
      preparedAt: hoursAgo(5),
      expiryAt: hoursFromNow(2),
      location: "Kuvempunagar, Mysuru",
      description: "Curd rice from a school function.",
      donor: donors[2]._id,
      status: "picked_up",
      ngo: ngos[2]._id,
      volunteer: volunteers[3]._id,
    },
    {
      foodName: "Puliyogare",
      foodType: "Veg",
      quantity: 65,
      unit: "packets",
      preparedAt: hoursAgo(10),
      expiryAt: hoursAgo(1),
      location: "Jayanagar, Bengaluru",
      description: "Tamarind rice delivered to Akshaya Seva Foundation.",
      donor: donors[0]._id,
      status: "delivered",
      ngo: ngos[0]._id,
      volunteer: volunteers[0]._id,
    },
    {
      foodName: "Bisi Bele Bath",
      foodType: "Veg",
      quantity: 90,
      unit: "packets",
      preparedAt: hoursAgo(12),
      expiryAt: hoursAgo(2),
      location: "Basavanagudi, Bengaluru",
      description: "Delivered successfully to Annapurna Trust kitchen.",
      donor: donors[1]._id,
      status: "delivered",
      ngo: ngos[1]._id,
      volunteer: volunteers[1]._id,
    },
    {
      foodName: "Bread and Buns",
      foodType: "Bakery",
      quantity: 120,
      unit: "pieces",
      preparedAt: hoursAgo(6),
      expiryAt: hoursAgo(1),
      location: "Kadri, Mangaluru",
      description: "Surplus bakery items from a local bakery chain.",
      donor: donors[2]._id,
      status: "delivered",
      ngo: ngos[2]._id,
      volunteer: volunteers[3]._id,
    },
    {
      foodName: "Fruit Juice Packets",
      foodType: "Packaged",
      quantity: 200,
      unit: "pieces",
      preparedAt: hoursAgo(20),
      expiryAt: hoursAgo(5),
      location: "MG Road, Bengaluru",
      description: "Sealed juice packets past their pickup window.",
      donor: donors[0]._id,
      status: "expired",
    },
    {
      foodName: "Pulao",
      foodType: "Veg",
      quantity: 35,
      unit: "packets",
      preparedAt: hoursAgo(1),
      expiryAt: hoursFromNow(7),
      location: "Vidyaranyapura, Bengaluru",
      description: "Vegetable pulao from a housewarming ceremony.",
      donor: donors[1]._id,
      status: "pending",
    },
    {
      foodName: "Dosa Batter Meals (packed dosas)",
      foodType: "Veg",
      quantity: 75,
      unit: "pieces",
      preparedAt: hoursAgo(2),
      expiryAt: hoursFromNow(1),
      location: "Vijayanagar, Mysuru",
      description: "Packed plain dosas from a college canteen surplus.",
      donor: donors[2]._id,
      status: "pending",
    },
  ];

  function sampleCoordsForDonationLocation(location) {
    if (location === "MG Road, Bengaluru") return SAMPLE.MG_ROAD;
    if (location === "Indiranagar, Bengaluru") return SAMPLE.INDIRANAGAR;
    if (location === "Jayanagar, Bengaluru") return SAMPLE.JAYANAGAR;
    if (location === "Basavanagudi, Bengaluru") return SAMPLE.BASAVANAGUDI;
    if (location === "HSR Layout, Bengaluru") return SAMPLE.HSR_LAYOUT;
    if (location === "Vidyaranyapura, Bengaluru") return SAMPLE.VIDYARANYAPURA;
    return null; // Mysuru and Mangaluru keep address text only
  }

  const donationsToInsert = donationData.map((donation) => {
    const row = { ...donation, remainingQuantity: donation.quantity };
    const coords = sampleCoordsForDonationLocation(donation.location);
    if (coords) {
      row.lat = coords.lat;
      row.lng = coords.lng;
    }
    return row;
  });

  const donations = await Donation.insertMany(donationsToInsert);
  console.log("Donations seeded:", donations.length);

  // ---------------- REQUESTS ----------------
  // Find a couple of pending donations to attach requests to
  const pendingDonations = donations.filter((d) => d.status === "pending");

  const requestData = [
    {
      donation: pendingDonations[0]._id,
      ngo: ngos[0]._id,
      quantityRequested: 30,
      message: "We can collect this within the hour, please keep it ready.",
      status: "pending",
    },
    {
      donation: pendingDonations[1]._id,
      ngo: ngos[1]._id,
      quantityRequested: 50,
      message: "Requesting on behalf of our evening shelter drive.",
      status: "pending",
    },
    {
      donation: pendingDonations[2]._id,
      ngo: ngos[2]._id,
      quantityRequested: 40,
      message: "Needed urgently for children at our day-care centre.",
      status: "approved",
    },
  ];

  const requests = await Request.insertMany(requestData);
  console.log("Requests seeded:", requests.length);

  // ---------------- PICKUPS ----------------
  // Build a Pickup record for every donation that has moved past "pending",
  // so the Pickup model always stays connected to and consistent with the
  // live Donation.status workflow (see FIX: Pickup <-> Donation connection).
  function findNgoById(ngoId) {
    return ngos.find((n) => String(n._id) === String(ngoId));
  }

  const pickupData = [];

  donations.forEach((donation) => {
    // "pending" and "expired" donations never had an NGO accept them,
    // so no Pickup record should exist for them yet.
    if (!["accepted", "picked_up", "delivered"].includes(donation.status)) return;

    const ngoUser = donation.ngo ? findNgoById(donation.ngo) : null;

    // Mirror the same stage the Donation is currently in:
    //  - accepted, no volunteer yet   -> Pickup "pending" (waiting for a volunteer to accept it)
    //  - accepted, volunteer assigned -> Pickup "accepted" (assigned, not yet picked up)
    //  - picked_up / delivered        -> Pickup matches exactly
    let pickupStatus = "pending";
    if (donation.status === "accepted" && donation.volunteer) pickupStatus = "accepted";
    if (donation.status === "picked_up") pickupStatus = "picked_up";
    if (donation.status === "delivered") pickupStatus = "delivered";

    const pickupTime = pickupStatus === "picked_up" || pickupStatus === "delivered" ? hoursAgo(2) : null;

    pickupData.push({
      donation: donation._id,
      volunteer: donation.volunteer || null,
      pickupLocation: donation.location,
      deliveryLocation: ngoUser ? ngoUser.address : "NGO",
      pickupTime,
      status: pickupStatus,
    });
  });

  const pickups = await Pickup.insertMany(pickupData);
  console.log("Pickups seeded:", pickups.length);

  console.log("\nSeeding complete!");
  console.log("All seeded users have the password: password123");
  console.log("Example login -> donor: ramesh.gowda@example.com");
  console.log("Example login -> ngo: contact@akshayaseva.org");
  console.log("Example login -> volunteer: arjun.nair@example.com");

  mongoose.connection.close();
}

seedDatabase().catch((err) => {
  console.log("Seeding error:", err);
  mongoose.connection.close();
});
