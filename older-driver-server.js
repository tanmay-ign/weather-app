const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

// Set MongoDB URI
const MONGODB_URI = 'mongodb+srv://tanmayupadhyay2005:tanmay@joker.emna4.mongodb.net/weatherApp?retryWrites=true&w=majority&appName=Joker';

console.log('Starting server with older MongoDB driver...');

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create Weather schema with older Mongoose syntax
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

// Routes
app.get('/api/weather/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const WEATHER_API_KEY = '151555f2a689822a727ddda090630e13';
    
    // Check for cached data
    const cachedData = await Weather.findOne({
      city: new RegExp(city, 'i'),
      createdAt: { $gt: new Date(Date.now() - 30 * 60 * 1000) }
    });
    
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
      description: weatherResponse.data.weather[0].description
    };
    
    // Save to database
    const newWeather = new Weather(weatherData);
    await newWeather.save();
    
    res.json(weatherData);
  } catch (error) {
    console.error('Weather API Error:', error);
    res.status(500).json({ message: 'Failed to fetch weather data' });
  }
});

app.get('/api/weather', async (req, res) => {
  try {
    const recentSearches = await Weather.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('city country temperature icon');
    
    res.json(recentSearches);
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ message: 'Failed to fetch recent searches' });
  }
});

// Connect to MongoDB with older driver options
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
.then(() => {
  console.log('MongoDB connected successfully!');
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('MongoDB connection failed:', err);
  
  // Start server anyway
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (without MongoDB)`);
  });
}); 