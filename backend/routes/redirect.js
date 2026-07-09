const Url = require('../models/Url');
const mongoose = require('mongoose');

// @route   GET /:code
// @desc    Redirect to the long URL
module.exports = async (req, res) => {
  try {
    // If MongoDB is not available, use mock database
    if (global.useMockDb) {
      global.mockDatabase = global.mockDatabase || [];
      const mockUrl = global.mockDatabase.find(url => url.urlCode === req.params.code);
      
      if (mockUrl) {
        // Increment click count
        mockUrl.clicks++;
        
        // Redirect to the long URL
        return res.redirect(mockUrl.longUrl);
      } else {
        return res.status(404).json({ error: 'URL not found' });
      }
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