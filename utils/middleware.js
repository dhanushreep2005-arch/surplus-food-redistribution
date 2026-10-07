// utils/middleware.js
//
// WHY THIS FILE EXISTS:
// Every role-specific route (donor, ngo, volunteer) needs to check
// "is someone logged in?" and "are they the correct role?".
// Writing this check once here keeps routes/controllers clean instead
// of repeating the same if-statement in every single route.

// Checks if a user is logged in (session has currentUser)
function isLoggedIn(req, res, next) {
  if (!req.session.currentUser) {
    req.session.errorMsg = "You must be logged in first.";
    return res.redirect("/login");
  }
  next();
}

// Checks if the logged-in user has one of the allowed roles
// Usage: checkRole("donor") or checkRole("ngo", "volunteer")
function checkRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.session.currentUser) {
      req.session.errorMsg = "You must be logged in first.";
      return res.redirect("/login");
    }
    if (!allowedRoles.includes(req.session.currentUser.role)) {
      req.session.errorMsg = "Access denied.";
      return res.redirect("/");
    }
    next();
  };
}

// Makes currentUser, successMsg and errorMsg available in every EJS template
// without passing them manually in every single controller
function passUserToViews(req, res, next) {
  res.locals.currentUser = req.session.currentUser || null;
  res.locals.successMsg = req.session.successMsg || null;
  res.locals.errorMsg = req.session.errorMsg || null;
  delete req.session.successMsg;
  delete req.session.errorMsg;
  next();
}

module.exports = { isLoggedIn, checkRole, passUserToViews };
