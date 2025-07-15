const express = require('express');
const router = express.Router();
const { nanoid } = require('nanoid');
const QRCode = require('qrcode');
const mongoose = require('mongoose');
const Url = require('../models/Url');

// @route   POST /api/shorten
// @desc    Create a short URL
router.post('/shorten', async (req, res) => {
  const { longUrl, expiryDays = 7 } = req.body;
  
  // Check if longUrl is valid
  try {
    const urlObj = new URL(longUrl);
    if (!urlObj.protocol || !urlObj.host) {
      return res.status(400).json({ error: 'Invalid URL' });
    }
  } catch (err) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  try {
    // Check MongoDB connection status
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Database not connected', 
        message: 'MongoDB is not connected. This is a demo mode with limited functionality.'
      });
    }
    
    // Check if URL already exists in database
    let url = await Url.findOne({ longUrl });

    if (url) {
      return res.json(url);
    }

    // Create URL code
    const urlCode = nanoid(6); // Generate a 6 character code
    const shortUrl = `${process.env.BASE_URL}/${urlCode}`;
    
    // Generate QR code
    const qrCode = await QRCode.toDataURL(shortUrl);
    
    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(expiryDays));

    // Create new URL document
    url = new Url({
      urlCode,
      longUrl,
      shortUrl,
      qrCode,
      expiresAt
    });

    await url.save();
    res.json(url);
  } catch (err) {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/urls
// @desc    Get all URLs
router.get('/urls', async (req, res) => {
  try {
    // Check MongoDB connection status
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json([]); // Return empty array in demo mode
    }
    
    const urls = await Url.find().sort({ createdAt: -1 });
    res.json(urls);
  } catch (err) {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/url/:id
// @desc    Delete a URL by ID
router.delete('/url/:id', async (req, res) => {
  try {
    // Check MongoDB connection status
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Database not connected', 
        message: 'MongoDB is not connected. This is a demo mode with limited functionality.'
      });
    }
    
    const url = await Url.findById(req.params.id);
    
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }
    
    await Url.findByIdAndDelete(req.params.id);
    res.json({ message: 'URL deleted successfully' });
  } catch (err) {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;