const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, // Link to Category
  description: { type: String },
  stock: { type: Number, default: 0 },
  imageUrl: { type: String }
});

module.exports = mongoose.model('Product', productSchema);
