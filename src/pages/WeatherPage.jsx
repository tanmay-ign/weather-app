import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import WeatherInfo from '../components/WeatherInfo';
import WeatherAnimation from '../components/WeatherAnimation';
import '../styles/WeatherPage.css';

const WeatherPage = () => {
  const { city } = useParams();
  const navigate = useNavigate();
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/weather/${city}`);
        setWeatherData(response.data);
        console.log('Weather data received', response.data);

        
        setError(null);
        
        // Set background based on weather condition
        const weatherCode = response.data.icon;
        if (weatherCode?.includes('01')) {
        } else if (weatherCode?.includes('02') || weatherCode?.includes('03')) {
          setBackgroundImage('/images/partly-cloudy-bg.jpg');
        } else if (weatherCode?.includes('04')) {
          setBackgroundImage('/images/cloudy-bg.jpg');
        } else if (weatherCode?.includes('09') || weatherCode?.includes('10')) {
          setBackgroundImage('/images/rainy-bg.jpg');
        } else if (weatherCode?.includes('11')) {
          setBackgroundImage('/images/storm-bg.jpg');
        } else if (weatherCode?.includes('13')) {
          setBackgroundImage('/images/snowy-bg.jpg');
        } else if (weatherCode?.includes('50')) {
          setBackgroundImage('/images/foggy-bg.jpg');
        } else {
          setBackgroundImage('/images/default-bg.jpg');
        }
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError(err.response?.data?.message || 'Failed to load weather data');
      } finally {
        setLoading(false);
      }
    };

    if (city) {
      fetchWeatherData();
    }
  }, [city]);

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <motion.div 
          className="loading-animation"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        >
          <img src="/images/loading.png" alt="Loading" style={{ width: '80px', height: '80px' }} />
        </motion.div>
        <p>Fetching weather data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <img src="/images/error.png" alt="Error" className="error-icon" />
        <h2>Error</h2>
        <p>{error}</p>
        <motion.button 
          onClick={handleBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Go Back
        </motion.button>
      </div>
    );
  }

  return (
    <div className="weather-page" style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}>
      <motion.div 
        className="back-button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleBack}
      >
        ← Back to Search
      </motion.div>
      
      {weatherData && (
        <div className="weather-container">
          <div className="weather-animation-container">
            <WeatherAnimation weatherCode={weatherData.icon} />
          </div>
          
          <WeatherInfo weatherData={weatherData} />
        </div>
      )}
    </div>
  );
};

export default WeatherPage; 