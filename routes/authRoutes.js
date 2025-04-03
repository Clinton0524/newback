const express = require("express");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const generateToken = require("../utils/jwt");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Register User
router.post(
  "/register",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: "User already exists" });

      user = new User({ name, email, password });
      await user.save();

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        token: generateToken(user._id),
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// ✅ Login User
router.post("/login", [
  check("email", "Please include a valid email").isEmail(),
  check("password", "Password is required").exists(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, sessionId } = req.body;
  try {
      const user = await User.findOne({ email });
      if (!user || !(await user.matchPassword(password))) {
          return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check for guest cart
      if (sessionId) {
          const guestCart = await Cart.findOne({ sessionId });
          let userCart = await Cart.findOne({ userId: user._id });

          if (guestCart) {
              if (userCart) {
                  // Merge guest cart into user cart
                  guestCart.items.forEach(guestItem => {
                      const existingItem = userCart.items.find(item => item.productId.equals(guestItem.productId));
                      if (existingItem) {
                          existingItem.quantity += guestItem.quantity;
                      } else {
                          userCart.items.push(guestItem);
                      }
                  });
                  await userCart.save();
              } else {
                  // Assign guest cart to user
                  guestCart.userId = user._id;
                  guestCart.sessionId = null; // Remove session binding
                  await guestCart.save();
              }
          }
      }

      res.status(200).json({
          success: true,
          message: "Login successful",
          token: generateToken(user._id),
      });
  } catch (err) {
      res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Get User Details (Protected Route)
router.get("/me", protect, async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

module.exports = router;
