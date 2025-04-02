const express = require("express");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const router = express.Router();

// ✅ Add a product to the cart
router.post("/add", async (req, res) => {
    try {
        let { userId, productId, quantity, sessionId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        if (!quantity || quantity < 1) {
            return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        if (!userId && !sessionId) {
            sessionId = uuidv4(); // Generate a new session ID for guest users
        }

        let cart = await Cart.findOne(userId ? { userId } : { sessionId });

        if (cart) {
            const itemIndex = cart.items.findIndex(item => item.productId.equals(productId));
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ productId, quantity });
            }
        } else {
            cart = new Cart({
                userId: userId || null,
                sessionId: userId ? null : sessionId,
                items: [{ productId, quantity }],
            });
        }

        await cart.save();
        res.json({ success: true, message: "Product added to cart", cart, sessionId });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ✅ Get user's cart (supports both userId and sessionId)
router.get("/cart", async (req, res) => {
    try {
        const { userId, sessionId } = req.query;

        if (!userId && !sessionId) {
            return res.status(400).json({ success: false, message: "User ID or session ID required" });
        }

        const cart = await Cart.findOne(userId ? { userId } : { sessionId }).populate("items.productId");

        if (!cart) {
            return res.json({ success: true, cart: { items: [] } });
        }

        res.json({ success: true, cart });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ✅ Remove an item from the cart (supports both userId and sessionId)
router.delete("/remove", async (req, res) => {
    try {
        const { userId, sessionId, productId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        if (!userId && !sessionId) {
            return res.status(400).json({ success: false, message: "User ID or session ID required" });
        }

        const cart = await Cart.findOne(userId ? { userId } : { sessionId });
        if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

        cart.items = cart.items.filter(item => !item.productId.equals(productId));

        await cart.save();
        res.json({ success: true, message: "Item removed from cart", cart });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ✅ Clear entire cart (supports both userId and sessionId)
router.delete("/clear", async (req, res) => {
    try {
        const { userId, sessionId } = req.body;

        if (!userId && !sessionId) {
            return res.status(400).json({ success: false, message: "User ID or session ID required" });
        }

        await Cart.findOneAndDelete(userId ? { userId } : { sessionId });
        res.json({ success: true, message: "Cart cleared" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
