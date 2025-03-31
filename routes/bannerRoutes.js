const express = require("express");
const Banner = require("../models/Banner");

const router = express.Router();

// ✅ Get all banners
router.get("/", async (req, res) => {
  try {
    const banners = await Banner.find();
    res.json({ success: true, count: banners.length, banners });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Get a single banner by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid banner ID" });
    }

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    res.json({ success: true, banner });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Create a new banner
router.post("/", async (req, res) => {
  try {
    const { title, imageUrl, description } = req.body;

    if (!title || !imageUrl) {
      return res.status(400).json({ success: false, message: "Title and imageUrl are required" });
    }

    const newBanner = new Banner({ title, imageUrl, description });
    await newBanner.save();

    res.status(201).json({ success: true, banner: newBanner });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ✅ Update a banner
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid banner ID" });
    }

    const updatedBanner = await Banner.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedBanner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    res.json({ success: true, banner: updatedBanner });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Delete a banner
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid banner ID" });
    }

    const deletedBanner = await Banner.findByIdAndDelete(id);
    if (!deletedBanner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    res.json({ success: true, message: "Banner deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
