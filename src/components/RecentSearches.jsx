import React from 'react';
import { motion } from 'framer-motion';
import '../styles/RecentSearches.css';

// Map weather conditions to local image files
const getLocalWeatherImage = (iconCode) => {
  // Default mapping of weather icon codes to local image files
  const iconMap = {
    '01d': '/images/sunny.png',
    '01n': '/images/clear-night.png',
    '02d': '/images/partly-cloudy.png',
    '02n': '/images/cloudy-night.png',
    '03d': '/images/cloudy.png',
    '03n': '/images/cloudy.png',
    '04d': '/images/cloudy.png',
    '04n': '/images/cloudy.png',
    '09d': '/images/rainy.png',
    '09n': '/images/rainy.png',
    '10d': '/images/rainy.png',
    '10n': '/images/rainy.png',
    '11d': '/images/thunderstorm.png',
    '11n': '/images/thunderstorm.png',
    '13d': '/images/snowy.png',
    '13n': '/images/snowy.png',
    '50d': '/images/foggy.png',
    '50n': '/images/foggy.png',
  };
  
  // Return the mapped local image path or a default if not found
  return iconMap[iconCode] || '/images/sunny.png';
};

const RecentSearches = ({ searches, onSelect }) => {
  // If searches is not an array or is empty, display a message
  if (!Array.isArray(searches) || searches.length === 0) {
    return (
      <div className="recent-searches">
        <h3>Recent Searches</h3>
        <p className="no-searches">No recent searches yet. Search for a city to get started!</p>
      </div>
    );
  }

  return (
    <div className="recent-searches">
      <h3>Recent Searches</h3>
      <div className="searches-container">
        {searches.map((search, index) => (
          <motion.div
            key={index}
            className="search-card"
            onClick={() => onSelect(search.city)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="search-info">
              <span className="search-city">{search.city}</span>
              <span className="search-country">{search.country}</span>
            </div>
            <div className="search-temp">
              {search.temperature}°C
              {/* Use the images from image.png folder */}
              
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RecentSearches; 