const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('category').exec();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new product
router.post("/", async (req, res) => {
    try {
      // Convert category to ObjectId
      req.body.category = new mongoose.Types.ObjectId(req.body.category);
  
      const newProduct = new Product(req.body);
      await newProduct.save();
  
      res.status(201).json(newProduct);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

module.exports = router;
