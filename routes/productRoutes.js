const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");

const router = express.Router();

// Get all products (with optional category filtering)
router.get("/", async (req, res) => {
    try {
      const { category } = req.query;
      let filter = {};
  
      if (category) {
        filter.category = category; // Filter by category
      }
  
      const products = await Product.find(filter).populate("category");
      res.json({ success: true, count: products.length, products });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
  
      // Validate if the ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid product ID" });
      }
  
      const product = await Product.findById(id).populate("category");
  
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
  
      res.json({ success: true, product });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

// Create a new product
router.post("/", async (req, res) => {
  try {
    const { name, price, category } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Ensure category is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    const newProduct = new Product({ name, price, category });
    await newProduct.save();

    res.status(201).json({ success: true, product: newProduct });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
