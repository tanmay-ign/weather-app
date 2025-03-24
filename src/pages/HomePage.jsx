import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import SearchBar from '../components/SearchBar';
import RecentSearches from '../components/RecentSearches';
import BackgroundAnimation from '../components/BackgroundAnimation';
import '../styles/HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentSearches = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/weather');
        setRecentSearches(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching recent searches:', err);
        setError('Failed to load recent searches');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentSearches();
  }, []);

  const handleSearch = (city) => {
    if (city.trim()) {
      navigate(`/weather/${city}`);
    }
  };

  return (
    <div className="home-page">
      <BackgroundAnimation />
      
      <motion.div 
        className="home-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1>Weather Forecast App</h1>
        <p>Get real-time weather information from around the world</p>
        
        <SearchBar onSearch={handleSearch} />
        
        {loading ? (
          <p>Loading recent searches...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <RecentSearches searches={recentSearches} onSelect={handleSearch} />
        )}
      </motion.div>
    </div>
  );
};

export default HomePage; 