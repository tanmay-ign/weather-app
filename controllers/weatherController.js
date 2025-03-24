const axios = require('axios');
const Weather = require('../models/Weather');
const fs = require('fs');
const path = require('path');
const localDb = require('../localdb'); // Use local DB instead of Mongoose
const weatherUtils = require('../utils/weatherUtils');

// More accurate time formatting
const formatTime = (timestamp, timezone) => {
  try {
    const date = new Date((timestamp + timezone) * 1000);
    
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    
    return `${formattedHours}:${formattedMinutes} ${period}`;
  } catch (error) {
    console.error('Time formatting error:', error);
    return 'Time unavailable';
  }
};

// Calculate rain probability more accurately
const calculateRainProbability = (forecastList) => {
  if (!forecastList || forecastList.length === 0) return 0;
  
  // Calculate weighted average of precipitation probability for next 12 hours
  let totalWeight = 0;
  let weightedProbability = 0;
  
  // Use first 4 forecast periods (typically covering 12 hours)
  const periodsToCheck = Math.min(4, forecastList.length);
  
  for (let i = 0; i < periodsToCheck; i++) {
    const weight = periodsToCheck - i; // Higher weight for closer periods
    const probability = (forecastList[i].pop || 0) * 100;
    
    weightedProbability += probability * weight;
    totalWeight += weight;
  }
  
  return Math.round(weightedProbability / totalWeight);
};

// Get detailed AQI information
const getAqiInfo = (aqi) => {
  const aqiData = {
    1: { 
      level: 'Good', 
      description: 'Air quality is considered satisfactory, and air pollution poses little or no risk'
    },
    2: { 
      level: 'Fair', 
      description: 'Air quality is acceptable; however, there may be some concern for a small number of people'
    },
    3: { level: 'Moderate', description: 'Air quality is moderate' },
    4: { level: 'Poor', description: 'Air quality is poor' },
    5: { level: 'Very Poor', description: 'Air quality is very poor' },
  };
  
  return aqiData[aqi] || { level: 'Unknown', description: 'Air quality data not available' };
};

// Get weather data
exports.getWeather = async (req, res) => {
  try {
    const { city } = req.params;
    
    // Check if recent data exists in database
    const cachedData = await Weather.findOne({ 
      city: new RegExp(city, 'i'),
      createdAt: { $gt: new Date(Date.now() - 30 * 60 * 1000) } // Data less than 30 minutes old
    });
    
    if (cachedData) {
      return res.json(cachedData);
    }
    
    // Weather API key
    const WEATHER_API_KEY = process.env.WEATHER_API_KEY || '151555f2a689822a727ddda090630e13';
    
    // Current weather data with detailed parameters
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric&lang=en`
    );
    
    const { coord, timezone } = weatherResponse.data;
    
    // Get air quality data
    const aqiResponse = await axios.get(
      `http://api.openweathermap.org/data/2.5/air_pollution?lat=${coord.lat}&lon=${coord.lon}&appid=${WEATHER_API_KEY}`
    );
    
    // Get 3-hour forecast for rain probability
    const forecastResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${coord.lat}&lon=${coord.lon}&appid=${WEATHER_API_KEY}&units=metric&cnt=8`
    );
    
    // Extract AQI information
    const aqi = aqiResponse.data.list[0].main.aqi;
    
    const aqiInfo = getAqiInfo(aqi);
    
    // Calculate accurate rain probability
    const rainProbability = calculateRainProbability(forecastResponse.data.list);
    
    // Format sunrise and sunset times with proper timezone
    const sunrise = formatTime(weatherResponse.data.sys.sunrise, timezone);
    const sunset = formatTime(weatherResponse.data.sys.sunset, timezone);
    
    // Get weather icon
    const iconCode = weatherResponse.data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    
    const weatherData = {
      city: weatherResponse.data.name,
      country: weatherResponse.data.sys.country,
      temperature: Math.round(weatherResponse.data.main.temp),
      feelsLike: Math.round(weatherResponse.data.main.feels_like),
      humidity: weatherResponse.data.main.humidity,
      windSpeed: Math.round(weatherResponse.data.wind.speed * 10) / 10,
      pressure: weatherResponse.data.main.pressure,
      aqi,
      aqiLevel: aqiInfo.level,
      aqiDescription: aqiInfo.description,
      rainProbability,
      sunrise,
      sunset,
      icon: iconCode,
      iconUrl,  // Store full URL
      description: weatherResponse.data.weather[0].description
    };
    
    // Save to database
    const newWeather = new Weather(weatherData);
    await newWeather.save();
    
    res.json(weatherData);
  } catch (error) {
    console.error('Weather API Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Failed to fetch weather data', error: error.message });
  }
};

// Get recent searches with fixed image paths
exports.getRecentSearches = async (req, res) => {
  try {
    const recentSearches = await Weather.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('city country temperature icon description');
    
    // Here we're sending the raw icon codes without modification
    // The React components will construct the correct path
    res.json(recentSearches);
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ message: 'Failed to fetch recent searches', error: error.message });
    // Return empty array instead of error to avoid UI breaking
    res.json([]);
  }
};

// Helper function to map OpenWeather icon codes to local image filenames
function mapWeatherIconToImage(iconCode) {
  const iconMap = {
    '01d': 'sunny.png',
    '01n': 'clear-night.png',
    '02d': 'partly-cloudy.png',
    '02n': 'cloudy-night.png',
    '03d': 'cloudy.png',
    '03n': 'cloudy.png',
    '04d': 'cloudy.png',
    '04n': 'cloudy.png',
    '09d': 'rainy.png',
    '09n': 'rainy.png',
    '10d': 'rainy.png',
    '10n': 'rainy.png',
    '11d': 'thunderstorm.png',
    '11n': 'thunderstorm.png',
    '13d': 'snowy.png',
    '13n': 'snowy.png',
    '50d': 'foggy.png',
    '50n': 'foggy.png',
  };
  
  return iconMap[iconCode] || 'sunny.png';
}