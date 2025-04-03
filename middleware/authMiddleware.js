const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect middleware
const protect = async (req, res, next) => {
    try {
        const token = req.cookies.jwt; // Get token from cookies

        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
            return res.status(401).json({ message: "User not found" });
        }

        next(); // Continue to next middleware/controller
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

// ✅ Role-based authorization middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied" });
        }
        next();
    };
};

module.exports = { protect, authorize };
