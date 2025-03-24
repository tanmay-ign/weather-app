// Force TLS downgrade before importing any other modules
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
process.env.NODE_OPTIONS = '--tls-min-v1.0 --tls-max-v1.2';

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

// Weather API key
const WEATHER_API_KEY = '151555f2a689822a727ddda090630e13';

// MongoDB URI with modified options
const MONGODB_URI = 'mongodb+srv://tanmayupadhyay2005:tanmay@joker.emna4.mongodb.net/weatherApp?retryWrites=true&w=majority&appName=Joker&tls=true&tlsInsecure=true';

console.log('Starting server with TLS downgrade options...');

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create Weather schema
const weatherSchema = new mongoose.Schema({
  city: String,
  country: String,
  temperature: Number,
  humidity: Number,
  aqi: Number,
  rainProbability: Number,
  sunset: String,
  icon: String,
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create Weather model
let Weather;
try {
  Weather = mongoose.model('Weather');
} catch (e) {
  Weather = mongoose.model('Weather', weatherSchema);
}

// Format time function
const formatTime = (timestamp, timezone) => {
  return new Date((timestamp + timezone) * 1000).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Get weather for a city
app.get('/api/weather/:city', async (req, res) => {
  try {
    const { city } = req.params;
    
    // Check for cached data
    const cachedData = await Weather.findOne({
      city: new RegExp(city, 'i'),
      createdAt: { $gt: new Date(Date.now() - 30 * 60 * 1000) }
    }).exec();
    
    if (cachedData) {
      return res.json(cachedData);
    }
    
    // Fetch from API
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}`
    );
    
    const weatherData = weatherResponse.data;
    
    // Create new Weather document
    const newWeather = new Weather({
      city: weatherData.name,
      country: weatherData.sys.country,
      temperature: weatherData.main.temp,
      humidity: weatherData.main.humidity,
      aqi: weatherData.air_quality,
      rainProbability: weatherData.pop,
      sunset: formatTime(weatherData.sys.sunset, weatherData.timezone),
      icon: weatherData.weather[0].icon,
      description: weatherData.weather[0].description,
      createdAt: Date.now()
    });
    
    // Save to database
    await newWeather.save();
    
    res.json(newWeather);
  } catch (error) {
    console.error('Error fetching weather:', error);
    res.status(500).json({ error: 'Failed to fetch weather' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 