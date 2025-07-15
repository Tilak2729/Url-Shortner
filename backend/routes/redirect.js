const Url = require('../models/Url');
const mongoose = require('mongoose');

// @route   GET /:code
// @desc    Redirect to the long URL
module.exports = async (req, res) => {
  try {
    // Check MongoDB connection status
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Database not connected', 
        message: 'MongoDB is not connected. This is a demo mode with limited functionality.'
      });
    }
    
    const url = await Url.findOne({ urlCode: req.params.code });

    if (url) {
      // Increment click count
      url.clicks++;
      await url.save();
      
      // Redirect to the long URL
      return res.redirect(url.longUrl);
    } else {
      return res.status(404).json({ error: 'URL not found' });
    }
  } catch (err) {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};