const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const axios = require('axios');

// MongoDB connection URI
const uri = "mongodb+srv://tanmayupadhyay2005:tanmay@joker.emna4.mongodb.net/?retryWrites=true&w=majority&appName=Joker";

// Create a new MongoClient
const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 5000
});

// Initialize express app
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database variables
let weatherCollection;

// Format time function
const formatTime = (timestamp, timezone) => {
  return new Date((timestamp + timezone) * 1000).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Routes
app.get('/api/weather/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const WEATHER_API_KEY = '151555f2a689822a727ddda090630e13';
    
    // Check for cached data if database is connected
    let cachedData = null;
    if (weatherCollection) {
      cachedData = await weatherCollection.findOne({
        city: new RegExp(city, 'i'),
        createdAt: { $gt: new Date(Date.now() - 30 * 60 * 1000) }
      });
    }
    
    if (cachedData) {
      return res.json(cachedData);
    }
    
    // Fetch from API
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`
    );
    
    const { coord } = weatherResponse.data;
    
    // Get air quality data
    const aqiResponse = await axios.get(
      `http://api.openweathermap.org/data/2.5/air_pollution?lat=${coord.lat}&lon=${coord.lon}&appid=${WEATHER_API_KEY}`
    );
    
    // Get 3-hour forecast for rain probability
    const forecastResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${coord.lat}&lon=${coord.lon}&appid=${WEATHER_API_KEY}&units=metric&cnt=3`
    );
    
    // Calculate rain probability for next 3 hours
    const rainProbability = forecastResponse.data.list.reduce((max, item) => {
      const pop = item.pop * 100; // Probability of precipitation (0-1)
      return pop > max ? pop : max;
    }, 0);
    
    // Extract AQI
    const aqi = aqiResponse.data.list[0].main.aqi;
    
    const weatherData = {
      city: weatherResponse.data.name,
      country: weatherResponse.data.sys.country,
      temperature: Math.round(weatherResponse.data.main.temp),
      humidity: weatherResponse.data.main.humidity,
      aqi,
      rainProbability,
      sunset: formatTime(weatherResponse.data.sys.sunset, weatherResponse.data.timezone),
      icon: weatherResponse.data.weather[0].icon,
      description: weatherResponse.data.weather[0].description,
      createdAt: new Date()
    };
    
    // Save to database if connected
    if (weatherCollection) {
      await weatherCollection.insertOne(weatherData);
    }
    
    res.json(weatherData);
  } catch (error) {
    console.error('Weather API Error:', error);
    res.status(500).json({ message: 'Failed to fetch weather data' });
  }
});

app.get('/api/weather', async (req, res) => {
  try {
    const recentSearches = await weatherCollection.find().sort({ createdAt: -1 }).limit(5).toArray();
    res.json(recentSearches);
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ message: 'Failed to fetch recent searches' });
  }
});

// Connect to MongoDB and start server
client.connect()
  .then(() => {
    console.log('MongoDB connected successfully!');
    weatherCollection = client.db().collection('weather');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (without MongoDB)`);
    });
  }); 