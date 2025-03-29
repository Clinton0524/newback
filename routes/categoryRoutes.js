const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

// Get all categories with pagination
router.get("/", async (req, res) => {
  try {
    let { categoryId, page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 12;
    const skip = (page - 1) * limit;

    let query = {};
    if (categoryId) {
      query.categoryId = categoryId; // Filter products by category
    }

    const products = await Product.find(query).skip(skip).limit(limit);
    const totalProducts = await Product.countDocuments(query);

    res.json({
      success: true,
      page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
      products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// Create a new category
router.post("/", async (req, res) => {
  try {
    const newCategory = new Category(req.body);
    await newCategory.save();
    res.json(newCategory);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
