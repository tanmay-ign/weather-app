import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Preload images
const preloadImages = [
  '/images/weather-logo.png',
  '/images/loading.png',
  '/images/cloud1.png',
  '/images/cloud2.png',
  '/images/cloud3.png',
  '/images/temperature.png',
  '/images/humidity.png',
  '/images/air-quality.png',
  '/images/rain.png',
  '/images/sunset.png',
  '/images/back-arrow.png',
  '/images/error.png',
  '/images/sunny-bg.png',
  '/images/rainy-bg.jpg',
  '/images/cloudy-bg.jpg',
  '/images/snowy-bg.jpg'
];

preloadImages.forEach(src => {
  const img = new Image();
  img.src = src;
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 