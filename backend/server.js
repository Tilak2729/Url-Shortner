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
  origin: [process.env.FRONTEND_URL], // Allow only the specified frontend origin
  credentials: true
}));

// Initialize mock database as fallback
global.mockDatabase = [];
global.useMockDb = false;

// Connect to MongoDB Atlas
console.log('Attempting to connect to MongoDB Atlas...');
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Atlas Connected Successfully');
    global.useMockDb = false;
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err.message);
    console.error('Please make sure the MongoDB Atlas connection string is correct');
    console.log('Using in-memory mock database instead. Data will not persist after server restart.');
    global.useMockDb = true;
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