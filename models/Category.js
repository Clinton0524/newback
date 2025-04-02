const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  isExclusive: { type: Boolean, default: false } // Add this field
});

module.exports = mongoose.model('Category', categorySchema);
