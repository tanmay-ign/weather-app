const express = require('express');
const cors = require('cors');
const { connectToMongoDB } = require('./mongodb');
const Weather = require('./Weather');

// Initialize express
const app = express();
app.use(cors());
app.use(express.json());

// Simple test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working' });
});

// MongoDB test route
app.get('/test-db', async (req, res) => {
  try {
    const testData = new Weather({
      city: 'Test City',
      country: 'Test Country',
      temperature: 20,
      humidity: 50,
      description
    });
    await testData.save();
    res.json({ message: 'MongoDB connection test successful' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to connect to MongoDB' });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 