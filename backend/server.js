const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'https://url-shortener-frontend-vercel.vercel.app'], // Allow specific origins
  credentials: true
}));

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err.message);
    console.error('Please make sure MongoDB is running and the connection string is correct');
    console.log('The application will continue to run, but database features will not work.');
  });

// Routes
app.use('/api', require('./routes/shorten'));

// Serve the shortened URL route
app.get('/:code', require('./routes/redirect'));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main page for the root route
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// Define port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));