const express = require("express");
const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Add or Update a Product in the Cart (Authenticated Users Only)
router.post("/add", protect, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user._id;

        if (!productId || !mongoose.Types.ObjectId.isValid(productId) || quantity < 1) {
            return res.status(400).json({ success: false, message: "Invalid product ID or quantity" });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [{ productId, quantity }] });
        } else {
            const item = cart.items.find(item => item.productId.equals(productId));
            if (item) {
                item.quantity += quantity;
            } else {
                cart.items.push({ productId, quantity });
            }
        }

        await cart.save();
        res.status(200).json({ success: true, message: "Cart updated", cart });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ✅ Get Cart (Authenticated Users Only)
router.get("/", protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const cart = await Cart.findOne({ userId }).populate("items.productId");
        res.status(200).json({ success: true, cart: cart || { items: [] } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ✅ Remove an Item from the Cart
router.delete("/remove", protect, async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user._id;

        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

        cart.items = cart.items.filter(item => !item.productId.equals(productId));
        await cart.save();

        res.status(200).json({ success: true, message: "Item removed from cart", cart });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ✅ Clear Entire Cart
router.delete("/clear", protect, async (req, res) => {
    try {
        const userId = req.user._id;
        await Cart.findOneAndDelete({ userId });
        res.status(200).json({ success: true, message: "Cart cleared" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ✅ Adjust Quantity of an Item in the Cart
router.put("/update", protect, async (req, res) => {
    try {
        const { productId, action } = req.body;
        const userId = req.user._id;

        if (!productId || !mongoose.Types.ObjectId.isValid(productId) || !["increase", "decrease"].includes(action)) {
            return res.status(400).json({ success: false, message: "Invalid request" });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

        const item = cart.items.find(item => item.productId.equals(productId));
        if (!item) return res.status(404).json({ success: false, message: "Item not found in cart" });

        if (action === "increase") {
            item.quantity += 1;
        } else if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            cart.items = cart.items.filter(item => !item.productId.equals(productId));
        }

        await cart.save();
        res.status(200).json({ success: true, message: "Cart updated", cart });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
