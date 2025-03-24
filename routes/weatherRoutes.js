const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

// Get weather data for a city
router.get('/:city', weatherController.getWeather);

// Get recent searches
router.get('/', weatherController.getRecentSearches);

module.exports = router; 