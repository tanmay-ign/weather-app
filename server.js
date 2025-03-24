const express = require('express');
const cors = require('cors');
const { connectToMongoDB, mongoose } = require('./mongodb');
const Weather = require('./Weather');
const fileDB = require('./filedb');
const axios = require('axios');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Add detailed startup logs
console.log('====================================');
console.log('Weather App Server Starting...');
console.log('Node.js Version:', process.version);
console.log('Current Directory:', process.cwd());
console.log('====================================');

// Middleware
app.use(cors({
  origin: '*', // Allow all origins
  credentials: true,
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
}));

// Add header middleware for image loading
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Also add this to ensure CORS is properly configured
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Track database status
let useMongoDB = true;

// Format time from timestamp
const formatTime = (timestamp, timezone) => {
  return new Date((timestamp + timezone) * 1000).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Simple test route to confirm the server is working
app.get('/test', (req, res) => {
  console.log('Test route accessed');
  res.json({ message: 'Server is running correctly' });
});

// Weather routes
app.get('/api/weather/:city', async (req, res) => {
  console.log('Fetching weather for city:', req.params.city);
  
  try {
    const { city } = req.params;
    let cachedData = null;
    
    // Try to get cached data
    if (useMongoDB) {
      try {
        console.log('Attempting to query MongoDB for cached data...');
        cachedData = await Weather.findOne({
          city: new RegExp(city, 'i'),
          createdAt: { $gt: new Date(Date.now() - 30 * 60 * 1000) }
        });
        console.log('MongoDB query successful. Cached data found:', !!cachedData);
      } catch (err) {
        console.error('MongoDB query error:', err);
        useMongoDB = false;
        
        // Try fileDB instead
        console.log('Falling back to file database...');
        cachedData = await fileDB.findOne('weather', {
          city: new RegExp(city, 'i'),
          createdAt: { $gt: new Date(Date.now() - 30 * 60 * 1000) }
        });
        console.log('File database query complete. Cached data found:', !!cachedData);
      }
    } else {
      // Use fileDB directly
      console.log('Using file database directly (MongoDB disabled)');
      cachedData = await fileDB.findOne('weather', {
        city: new RegExp(city, 'i'),
        createdAt: { $gt: new Date(Date.now() - 30 * 60 * 1000) }
      });
      console.log('File database query complete. Cached data found:', !!cachedData);
    }
    
    if (cachedData) {
      console.log('Returning cached weather data');
      return res.json(cachedData);
    }
    
    // If no cached data, fetch from API
    console.log('No cached data found. Fetching from Weather API...');
    const weatherApiKey = process.env.WEATHER_API_KEY || '151555f2a689822a727ddda090630e13';
    
    // Current weather data
    console.log('Fetching current weather data...');
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`
    );
    console.log('Current weather data received', weatherResponse.data);
    
    const { coord } = weatherResponse.data;
    
    // Get air quality data
    console.log('Fetching air quality data...');
    const aqiResponse = await axios.get(
      `http://api.openweathermap.org/data/2.5/air_pollution?lat=${coord.lat}&lon=${coord.lon}&appid=${weatherApiKey}`
    );

    console.log('Air quality data received', aqiResponse.data);
    
    // Get 3-hour forecast for rain probability
    console.log('Fetching forecast data...');
    const forecastResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${coord.lat}&lon=${coord.lon}&appid=${weatherApiKey}&units=metric&cnt=3`
    );
    console.log('Forecast data received');
    
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
      sunsetTimestamp: weatherResponse.data.sys.sunset,
      timezone: weatherResponse.data.timezone, 
      icon: weatherResponse.data.weather[0].icon,
      description: weatherResponse.data.weather[0].description
    };
    
    console.log('Weather data assembled:', JSON.stringify(weatherData, null, 2));
    
    // Save data
    if (useMongoDB) {
      try {
        console.log('Saving weather data to MongoDB...');
        const newWeather = new Weather(weatherData);
        await newWeather.save();
        console.log('Data successfully saved to MongoDB');
      } catch (err) {
        console.error('MongoDB save error:', err);
        useMongoDB = false;
        
        // Fallback to fileDB
        console.log('Falling back to file database for saving...');
        await fileDB.save('weather', weatherData);
        console.log('Data successfully saved to file database');
      }
    } else {
      // Use fileDB directly
      console.log('Saving weather data to file database...');
      await fileDB.save('weather', weatherData);
      console.log('Data successfully saved to file database');
    }
    
    console.log('Returning weather data to client');
    res.json(weatherData);
  } catch (error) {
    console.error('Weather API Error:', error);
    res.status(500).json({ message: 'Failed to fetch weather data', error: error.message });
  }
});

// Get recent searches
app.get('/api/weather', async (req, res) => {
  console.log('Fetching recent searches');
  
  try {
    let recentSearches = [];
    
    if (useMongoDB) {
      try {
        console.log('Attempting to query MongoDB for recent searches...');
        recentSearches = await Weather.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select({ city: 1, country: 1, temperature: 1, icon: 1 });
        console.log(`MongoDB query successful. Found ${recentSearches.length} recent searches`);
      } catch (err) {
        console.error('MongoDB query error:', err);
        useMongoDB = false;
        
        // Try fileDB instead
        console.log('Falling back to file database...');
        recentSearches = await fileDB.find('weather')
          .sort({ createdAt: -1 })
          .limit(5)
          .select({ city: 1, country: 1, temperature: 1, icon: 1 });
        console.log(`File database query complete. Found ${recentSearches.length} recent searches`);
      }
    } else {
      // Use fileDB directly
      console.log('Using file database directly (MongoDB disabled)');
      recentSearches = await fileDB.find('weather')
        .sort({ createdAt: -1 })
        .limit(5)
        .select({ city: 1, country: 1, temperature: 1, icon: 1 });
      console.log(`File database query complete. Found ${recentSearches.length} recent searches`);
    }
    
    console.log('Returning recent searches to client');
    res.json(recentSearches);
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ message: 'Failed to fetch recent searches' });
  }
});

// Serve static files from the public directory
app.use(express.static('public'));

// Alternatively, if your image folder is in the client/public directory:
app.use('/images', express.static(path.join(__dirname, '../client/public/images')));

// Make sure you have the correct path to your image.png folder
// This assumes image.png is in the public folder of your project
app.use('/image.png', express.static(path.join(__dirname, '../public/image.png')));

// If your image.png folder is in client/public directory, use this instead:
// app.use('/image.png', express.static(path.join(__dirname, '../client/public/image.png')));

// Start server
const startServer = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    // Try to connect to MongoDB
    await connectToMongoDB();
    useMongoDB = true;
    console.log('✅ MongoDB connection successful!');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    console.log('Switching to file database for storage');
    useMongoDB = false;
  }
  
  // Start the server regardless of MongoDB connection
  app.listen(PORT, () => {
    console.log('====================================');
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`Storage: ${useMongoDB ? 'MongoDB' : 'File Database'}`);
    console.log(`API Endpoints:`);
    console.log(`- GET /test - Test endpoint`);
    console.log(`- GET /api/weather/:city - Get weather for a city`);
    console.log(`- GET /api/weather - Get recent searches`);
    console.log('====================================');
  });
};

startServer().catch(err => {
  console.error('Unhandled error during server startup:', err);
  console.log('Starting server without MongoDB connection...');
  
  // Start server even if there's an error
  app.listen(PORT, () => {
    console.log('====================================');
    console.log(`⚠️ Server running on port ${PORT} (with errors)`);
    console.log('Storage: File Database (fallback)');
    console.log('====================================');
  });
}); 