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
    // If MongoDB is not available, use mock database
    if (global.useMockDb) {
      // Generate URL code and other data
      const urlCode = nanoid(6);
      const shortUrl = `${process.env.BASE_URL}/${urlCode}`;
      
      // Generate QR code
      const qrCode = await QRCode.toDataURL(shortUrl);
      
      // Calculate expiry date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiryDays));
      
      // Create mock URL object
      const mockUrl = {
        _id: nanoid(24), // Generate a mock ID similar to MongoDB ObjectId
        urlCode,
        longUrl,
        shortUrl,
        qrCode,
        clicks: 0,
        createdAt: new Date(),
        expiresAt
      };
      
      // Add to mock database
      global.mockDatabase = global.mockDatabase || [];
      global.mockDatabase.push(mockUrl);
      
      return res.json(mockUrl);
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
    // If MongoDB is not available, use mock database
    if (global.useMockDb) {
      global.mockDatabase = global.mockDatabase || [];
      return res.json(global.mockDatabase.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
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
    // If MongoDB is not available, use mock database
    if (global.useMockDb) {
      global.mockDatabase = global.mockDatabase || [];
      const urlIndex = global.mockDatabase.findIndex(url => url._id === req.params.id || url.urlCode === req.params.id);
      
      if (urlIndex !== -1) {
        global.mockDatabase.splice(urlIndex, 1);
        return res.json({ success: true });
      } else {
        return res.status(404).json({ error: 'URL not found' });
      }
    }
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