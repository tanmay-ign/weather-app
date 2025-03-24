import { useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/SearchBar.css';

const SearchBar = ({ onSearch }) => {
  const [city, setCity] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city);
      setCity('');
    }
  };

  return (
    <motion.form 
      className={`search-bar ${isFocused ? 'focused' : ''}`}
      onSubmit={handleSubmit}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <input
        type="text"
        placeholder="Enter a city name..."
        value={city}
        onChange={(e) => setCity(e.target.value)}
        required
      />
      <motion.button 
        type="submit"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Search
      </motion.button>
    </motion.form>
  );
};

export default SearchBar; 