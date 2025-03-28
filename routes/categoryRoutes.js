const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Get all categories
router.get('/', async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

// Create a new category
router.post('/', async (req, res) => {
  const newCategory = new Category(req.body);
  await newCategory.save();
  res.json(newCategory);
});

module.exports = router;
