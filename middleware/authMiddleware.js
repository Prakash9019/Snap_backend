const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");

// Middleware: protect routes (works for both old & new apps)
const protect = async (req, res, next) => {
  let token;

  // ✅ Support both `x-auth-token` (old app) and `Authorization: Bearer` (new app)
  if (req.header("x-auth-token")) {
    token = req.header("x-auth-token");
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ msg: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // First check if admin
    let user = await Admin.findById(decoded.id).select("-password");

    if (!user) {
      // If not admin, check user
      user = await User.findById(decoded.id).select("-password");
    }

    if (!user) {
      return res.status(401).json({ msg: "Not authorized, user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ msg: "Not authorized, token failed" });
  }
};

// Middleware: restrict to admin only
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(401).json({ msg: "Not authorized as an admin" });
  }
};

module.exports = { protect, admin };
