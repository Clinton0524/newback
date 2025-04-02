const express = require("express");
const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const router = express.Router();

// ✅ Add a product to the cart
router.post("/add", async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid user or product ID" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    let cart = await Cart.findOne({ userId });

    if (cart) {
      // Check if product already exists in cart
      const itemIndex = cart.items.findIndex(item => item.productId.equals(productId));

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
    } else {
      cart = new Cart({
        userId,
        items: [{ productId, quantity }],
      });
    }

    await cart.save();
    res.json({ success: true, message: "Product added to cart", cart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Get user's cart
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) {
      return res.json({ success: true, cart: { userId, items: [] } });
    }

    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Remove an item from cart
router.delete("/remove", async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid user or product ID" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    cart.items = cart.items.filter(item => !item.productId.equals(productId));

    await cart.save();
    res.json({ success: true, message: "Item removed from cart", cart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Clear entire cart
router.delete("/clear/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    await Cart.findOneAndDelete({ userId });
    res.json({ success: true, message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
