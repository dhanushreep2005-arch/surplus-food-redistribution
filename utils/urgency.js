// utils/urgency.js
//
// WHY THIS FILE EXISTS:
// The "remaining time" and "urgency level" calculation is needed in many
// places at once - donor dashboard, NGO dashboard, donation show page,
// donations list, etc. Instead of copy-pasting the same JavaScript Date
// math into every EJS file, we write it once here and reuse it everywhere.
// This is plain rule-based JavaScript logic (NOT AI/ML). Later this file
// is the natural place to plug in an AI-based spoilage prediction model.

// Takes a donation's expiryAt (Date) and returns a readable "time left" string
function getRemainingTime(expiryAt) {
  const now = new Date();
  const expiry = new Date(expiryAt);
  const diffMs = expiry - now;

  if (diffMs <= 0) {
    return "Expired";
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""} ${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }
  return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
}

// Simple rule-based urgency calculation based on hours remaining
// >6 hrs   -> LOW
// 2-6 hrs  -> MEDIUM
// <2 hrs   -> HIGH
// passed   -> EXPIRED
function getUrgencyLevel(expiryAt) {
  const now = new Date();
  const expiry = new Date(expiryAt);
  const diffMs = expiry - now;

  if (diffMs <= 0) {
    return "EXPIRED";
  }

  const hoursRemaining = diffMs / (1000 * 60 * 60);

  if (hoursRemaining > 6) {
    return "LOW";
  } else if (hoursRemaining > 2) {
    return "MEDIUM";
  } else {
    return "HIGH";
  }
}

// Returns the Bootstrap badge color class for a given urgency level
function getUrgencyBadgeClass(urgency) {
  switch (urgency) {
    case "LOW":
      return "bg-success";
    case "MEDIUM":
      return "bg-warning text-dark";
    case "HIGH":
      return "bg-danger";
    case "EXPIRED":
      return "bg-secondary";
    default:
      return "bg-secondary";
  }
}

// Returns true if a donation's expiry time has already passed
function isExpired(expiryAt) {
  return new Date(expiryAt) <= new Date();
}

module.exports = {
  getRemainingTime,
  getUrgencyLevel,
  getUrgencyBadgeClass,
  isExpired,
};
