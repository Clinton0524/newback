const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

// Get all categories with pagination
router.get("/", async (req, res) => {
  try {
    let { page, limit } = req.query;

    // Convert to numbers and set default values
    page = parseInt(page) || 1; // Default: page 1
    limit = parseInt(limit) || 10; // Default: 10 categories per page

    const skip = (page - 1) * limit; // Calculate how many categories to skip

    // Fetch paginated categories
    const categories = await Category.find().skip(skip).limit(limit);

    // Count total categories for pagination metadata
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
    const newCategory = new Category(req.body);
    await newCategory.save();
    res.json(newCategory);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
