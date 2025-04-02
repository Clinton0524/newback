const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const router = express.Router();

// ✅ Checkout and Place Order
router.post("/checkout", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    let totalAmount = 0;

    // Validate stock and calculate total price
    for (let item of cart.items) {
      const product = item.productId;

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${product.name}. Available: ${product.stock}`,
        });
      }

      totalAmount += product.price * item.quantity;
    }

    // Deduct stock and save changes
    for (let item of cart.items) {
      await Product.findByIdAndUpdate(item.productId._id, { $inc: { stock: -item.quantity } });
    }

    // Create Order
    const order = new Order({
      userId,
      items: cart.items.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.price,
      })),
      totalAmount,
    });

    await order.save();

    // Clear Cart
    await Cart.findOneAndDelete({ userId });

    res.status(201).json({ success: true, message: "Order placed successfully", order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Get User Orders
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const orders = await Order.find({ userId }).populate("items.productId");

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Get Order by ID
router.get("/order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await Order.findById(orderId).populate("items.productId");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Cancel Order
router.put("/cancel/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status !== "Pending") {
      return res.status(400).json({ success: false, message: "Only pending orders can be canceled" });
    }

    order.status = "Cancelled";
    await order.save();

    res.json({ success: true, message: "Order cancelled successfully", order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Update Order Status (Admin Functionality)
router.put("/update/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
