const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if it's an admin or a user
      req.user = await Admin.findById(decoded.id).select("-password");
      if (!req.user) {
        req.user = await User.findById(decoded.id).select("-password");
      }

      if (!req.user) {
        return res.status(401).json({ msg: "Not authorized, user not found" });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ msg: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ msg: "Not authorized, no token" });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(401).json({ msg: "Not authorized as an admin" });
  }
};

module.exports = { protect, admin };
