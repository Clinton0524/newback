const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized: No token provided" });

    // ✅ FIX: Proper JWT verification without a callback
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Find user in DB
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ message: "Unauthorized: User not found" });

    next(); // Proceed to next middleware
  } catch (err) {
    res.status(401).json({ message: "Invalid or Expired Token" });
  }
};
const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }
    next();
  };

module.exports = { protect, authorize };
