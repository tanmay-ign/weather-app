/**
 * Weather utility functions for accurate data processing
 */

// Format time from timestamp with timezone support
exports.formatTime = (timestamp, timezone) => {
  if (!timestamp) return 'N/A';
  
  // Convert to milliseconds and apply timezone offset
  const date = new Date((timestamp + timezone) * 1000);
  
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Calculate accurate rain probability from forecast data
exports.calculateRainProbability = (forecastList) => {
  if (!forecastList || forecastList.length === 0) return 0;
  
  // Calculate max probability in the next 3 hours
  const maxProbability = forecastList.reduce((max, item) => {
    // pop is probability of precipitation (0-1)
    const pop = (item.pop || 0) * 100;
    return pop > max ? pop : max;
  }, 0);
  
  return Math.round(maxProbability);
};

// Get detailed AQI information based on index
exports.getAQIDetails = (aqi) => {
  switch (aqi) {
    case 1:
      return {
        level: 'Good',
        description: 'Air quality is satisfactory, and air pollution poses little or no risk.',
        color: '#7CD992'
      };
    case 2:
      return {
        level: 'Fair',
        description: 'Air quality is acceptable; however, pollution may pose a moderate health concern for sensitive individuals.',
        color: '#F8E16C'
      };
    case 3:
      return {
        level: 'Moderate',
        description: 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.',
        color: '#FFA26B'
      };
    case 4:
      return {
        level: 'Poor',
        description: 'Health alert: everyone may experience more serious health effects.',
        color: '#EF6F6C'
      };
    case 5:
      return {
        level: 'Very Poor',
        description: 'Health warnings of emergency conditions. The entire population is more likely to be affected.',
        color: '#A97ABC'
      };
    default:
      return {
        level: 'Unknown',
        description: 'Air quality information is not available.',
        color: '#999999'
      };
  }
};

// Format wind information to include direction
exports.formatWindInfo = (speed, deg) => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 22.5) % 16;
  
  return {
    speed: speed,
    direction: directions[index],
    deg: deg
  };
};

// Get full icon URL
exports.getIconUrl = (iconCode) => {
  if (!iconCode) return null;
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};

// Process and enhance weather data for better accuracy
exports.processWeatherData = (weatherData, forecastData, aqiData, timezone) => {
  const { formatTime, calculateRainProbability, getAQIDetails, formatWindInfo, getIconUrl } = exports;
  
  // Extract basic weather data
  const basic = {
    city: weatherData.name,
    country: weatherData.sys.country,
    temperature: Math.round(weatherData.main.temp),
    humidity: weatherData.main.humidity,
    pressure: weatherData.main.pressure,
    description: weatherData.weather[0].description,
  };
  
  // Process wind information
  const wind = formatWindInfo(weatherData.wind.speed, weatherData.wind.deg);
  
  // Process AQI data
  const aqi = aqiData.list[0].main.aqi;
  const aqiDetails = getAQIDetails(aqi);
  
  // Process time information
  const times = {
    sunrise: formatTime(weatherData.sys.sunrise, timezone),
    sunset: formatTime(weatherData.sys.sunset, timezone),
    updatedAt: new Date()
  };
  
  // Process rain probability
  const rainProbability = calculateRainProbability(forecastData.list.slice(0, 3));
  
  // Process icon
  const iconCode = weatherData.weather[0].icon;
  const iconUrl = getIconUrl(iconCode);
  
  // Combine all data
  return {
    ...basic,
    windSpeed: wind.speed,
    windDirection: wind.direction,
    windDeg: wind.deg,
    aqi,
    aqiLevel: aqiDetails.level,
    aqiDescription: aqiDetails.description,
    aqiColor: aqiDetails.color,
    rainProbability,
    ...times,
    icon: iconCode,
    iconUrl,
    createdAt: new Date()
  };
}; 