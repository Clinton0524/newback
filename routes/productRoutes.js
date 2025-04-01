const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");

const router = express.Router();

// ✅ Get all products (with search & filtering)
router.get("/", async (req, res) => {
  try {
    const { category, name, minPrice, maxPrice, inStock, sort } = req.query;
    let filter = {};

    // 🔹 Filter by Category (if provided)
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      filter.category = category;
    }

    // 🔹 Search by Name (Case-Insensitive)
    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    // 🔹 Filter by Price Range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // 🔹 Filter by Stock Availability
    if (inStock === "true") {
      filter.stock = { $gt: 0 }; // Only available products
    } else if (inStock === "false") {
      filter.stock = 0; // Only out-of-stock products
    }

    // 🔹 Sorting (e.g., ?sort=price_asc or ?sort=name_desc)
    let sortOptions = {};
    if (sort) {
      const [field, order] = sort.split("_");
      sortOptions[field] = order === "desc" ? -1 : 1;
    }

    // Fetch products with filters and sorting
    const products = await Product.find(filter).populate("category").sort(sortOptions);

    res.json({ success: true, count: products.length, products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Get a single product by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

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

// ✅ Create a new product
router.post("/", async (req, res) => {
  try {
    const { name, price, category } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    const newProduct = new Product({ ...req.body });
    await newProduct.save();

    res.status(201).json({ success: true, product: newProduct });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ✅ Update an existing product
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product updated successfully", product: updatedProduct });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Delete a product
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
