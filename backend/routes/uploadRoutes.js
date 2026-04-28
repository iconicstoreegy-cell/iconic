const express = require('express');
const { upload } = require('../config/cloudinary');
const { protect, admin } = require('../middleware/authMiddleware');
const asyncHandler = require('express-async-handler');

const router = express.Router();

// Upload single image
router.post(
  '/image',
  protect,
  admin,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400);
      throw new Error('No file uploaded');
    }
    res.json({ url: req.file.path, public_id: req.file.filename });
  })
);

// Upload multiple images — admin only (products)
router.post(
  '/images',
  protect,
  admin,
  upload.array('images', 10),
  asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      res.status(400);
      throw new Error('No files uploaded');
    }
    const urls = req.files.map((f) => ({ url: f.path, public_id: f.filename }));
    res.json(urls);
  })
);

// Upload receipt — any logged-in user (for transfer payment proof)
router.post(
  '/receipt',
  protect,
  upload.single('images'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400);
      throw new Error('No file uploaded');
    }
    res.json([{ url: req.file.path, public_id: req.file.filename }]);
  })
);

module.exports = router;
