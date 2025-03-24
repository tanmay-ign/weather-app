import React from 'react';
import { motion } from 'framer-motion';
import '../styles/WeatherInfo.css';

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
    '50d': '/images/sunny.png',
    '50n': '/images/foggy.png',
  };
  
  // Return the mapped local image path or a default if not found
  return iconMap[iconCode] || '/images/sunny.png';
};

const WeatherInfo = ({ weatherData }) => {
  const {
    city,
    country,
    temperature,
    feelsLike,
    humidity,
    pressure,
    aqi,
    aqiLevel,
    aqiDescription,
    rainProbability,
    sunset,
    sunsetTimestamp,
    timezone,
    description,
    icon,
    localImagePath
  } = weatherData;
  console.log(weatherData.sunsetTimestamp);

  // Get AQI color based on level
  const getAqiColor = (level) => {
    switch (level) {
      case 'Good': return '#4CAF50';
      case 'Fair': return '#8BC34A';
      case 'Moderate': return '#FFC107';
      case 'Poor': return '#FF9800';
      case 'Very Poor': return '#F44336';
      default: return '#9E9E9E';
    }
  };
  

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  const adjustedSunset = sunset + " (GMT)";	


  

  return (
    <div className="weather-info">
      
      <motion.div 
        className="location-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="weather-icon-container">
          <motion.img 
            src={localImagePath || getLocalWeatherImage(icon)}
            alt={description}
            className="current-weather-icon"
            onError={(e) => {
              e.target.src = `/images/${icon}.png`;
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <h1>{city}, {country}</h1>
        <p className="weather-description">{description}</p>
        <p className="feels-like">Feels like: {feelsLike}°C</p>
      </motion.div>

      <div className="weather-cards">
        <motion.div 
          className="weather-card temperature-card"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
        >
          <h3>Temperature</h3>
          <div className="card-value">{temperature}°C</div>
          <div className="card-icon">
          </div>
        </motion.div>

        <motion.div 
          className="weather-card humidity-card"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <h3>Humidity</h3>
          <div className="card-value">{humidity}%</div>
          <div className="humidity-bar">
            <div className="humidity-fill" style={{ width: `${humidity}%` }}></div>
          </div>
          <div className="card-icon">
          </div>
        </motion.div>

        

        {pressure && (
          <motion.div 
            className="weather-card pressure-card"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.35 }}
          >
            <h3>Pressure</h3>
            <div className="card-value">{pressure} hPa</div>
            <div className="card-icon">
            </div>
          </motion.div>
        )}

        <motion.div 
          className="weather-card aqi-card"
          variants={cardVariants}
          initial="hidden"
          animate="visible" 
          transition={{ delay: 0.4 }}
        >
          <h3>Air Quality</h3>
          <div className="card-value aqi-value">
          {weatherData.aqi ? (
  <>
    <span 
      className="aqi-label"
      style={{ color: "white" }}
    >
          AQI: {aqi} 
          </span>
          </>
          ) : 'N/A'}

          </div>
          {aqiDescription && <p className="aqi-description">{aqiDescription}</p>}
          <div className="card-icon">
          </div>
        </motion.div>

        <motion.div 
          className="weather-card rain-card"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
        >
          <h3>Rain Probability</h3>
          <div className="card-value">{rainProbability || 0}%</div>
          <div className="rain-probability-container">
            <div className="rain-probability-bar">
              <div 
                className="rain-probability-fill" 
                style={{ height: `${rainProbability || 0}%` }}
              ></div>
            </div>
          </div>
          <div className="card-icon">
          </div>
        </motion.div>

        <motion.div 
          className="weather-card sunset-card"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
        >
          <h3>Sunset</h3>
          <div className="card-value">{adjustedSunset}</div>
          <div className="card-icon sun-transition">
          </div>
        </motion.div>
        
        
      </div>
    </div>
  );
};

export default WeatherInfo; 