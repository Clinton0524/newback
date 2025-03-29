const express = require("express");
const Category = require("../models/Category");

const router = express.Router();

// Get all categories (with pagination)
router.get("/", async (req, res) => {
  try {
    let { page, limit } = req.query;

    page = parseInt(page) || 1; // Default: page 1
    limit = parseInt(limit) || 10; // Default: 10 categories per page

    const skip = (page - 1) * limit;
    const categories = await Category.find().skip(skip).limit(limit);
    const totalCategories = await Category.countDocuments();

    res.json({
      success: true,
      page,
      totalPages: Math.ceil(totalCategories / limit),
      totalCategories,
      categories,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create a new category
router.post("/", async (req, res) => {
  try {
    const { name, slug } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ success: false, message: "Name and slug are required" });
    }

    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: "Category slug already exists" });
    }

    const newCategory = new Category({ name, slug });
    await newCategory.save();

    res.status(201).json({ success: true, category: newCategory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
