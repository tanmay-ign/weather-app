const mongoose = require('mongoose');

// Create schema
const weatherSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  temperature: {
    type: Number,
    required: true
  },
  feelsLike: {
    type: Number
  },
  humidity: {
    type: Number,
    required: true
  },
  windSpeed: {
    type: Number
  },
  pressure: {
    type: Number
  },
  aqi: {
    type: Number
  },
  aqiLevel: {
    type: String
  },
  aqiDescription: {
    type: String
  },
  rainProbability: {
    type: Number,
    default: 0
  },
  sunrise: {
    type: String
  },
  sunset: {
    type: String
  },
  icon: {
    type: String
  },
  description: {
    type: String
  },
  localImagePath: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create or get existing model
let Weather;
try {
  Weather = mongoose.model('Weather');
} catch (e) {
  Weather = mongoose.model('Weather', weatherSchema);
}

module.exports = Weather; 