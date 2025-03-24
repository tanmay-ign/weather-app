import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../styles/WeatherAnimation.css';

const WeatherAnimation = ({ weatherCode }) => {
  const containerRef = useRef(null);
  
  // Determine weather type
  const isRainy = weatherCode?.includes('09') || weatherCode?.includes('10');
  const isSnowy = weatherCode?.includes('13');
  const isThunderstorm = weatherCode?.includes('11');
  const isCloudy = weatherCode?.includes('02') || weatherCode?.includes('03') || weatherCode?.includes('04');
  const isFoggy = weatherCode?.includes('50');
  const isSunny = weatherCode?.includes('01');
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear existing elements
    containerRef.current.innerHTML = '';
    
    // Create different animations based on weather
    if (isRainy) {
      createRaindrops();
    } else if (isSnowy) {
      createSnowflakes();
    } else if (isThunderstorm) {
      createThunderstorm();
    } else if (isCloudy) {
      createClouds();
    } else if (isFoggy) {
      createFog();
    } else if (isSunny) {
      createSunRays();
    }
  }, [weatherCode, isRainy, isSnowy, isThunderstorm, isCloudy, isFoggy, isSunny]);
  
  const createRaindrops = () => {
    const container = containerRef.current;
    
    for (let i = 0; i < 50; i++) {
      const drop = document.createElement('div');
      drop.className = 'raindrop';
      
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.animationDuration = `${Math.random() * 1 + 0.5}s`;
      drop.style.animationDelay = `${Math.random() * 2}s`;
      
      container.appendChild(drop);
    }
  };
  
  const createSnowflakes = () => {
    const container = containerRef.current;
    
    for (let i = 0; i < 40; i++) {
      const flake = document.createElement('div');
      flake.className = 'snowflake';
      
      flake.style.left = `${Math.random() * 100}%`;
      flake.style.animationDuration = `${Math.random() * 5 + 5}s`;
      flake.style.animationDelay = `${Math.random() * 5}s`;
      flake.style.opacity = Math.random() * 0.8 + 0.2;
      flake.style.width = flake.style.height = `${Math.random() * 8 + 4}px`;
      
      container.appendChild(flake);
    }
  };
  
  const createThunderstorm = () => {
    const container = containerRef.current;
    
    // Create rain first
    createRaindrops();
    
    // Then add lightning
    const lightning = document.createElement('div');
    lightning.className = 'lightning';
    container.appendChild(lightning);
    
    // Randomly show lightning
    setInterval(() => {
      lightning.style.opacity = '1';
      setTimeout(() => {
        lightning.style.opacity = '0';
      }, 200);
    }, 3000);
  };
  
  const createClouds = () => {
    const container = containerRef.current;
    const cloudImages = ['cloud1.png', 'cloud2.png', 'cloud3.png'];
    
    for (let i = 0; i < 5; i++) {
      const cloud = document.createElement('img');
      cloud.src = `/images/${cloudImages[i % cloudImages.length]}`;
      cloud.className = 'animated-cloud';
      
      cloud.style.top = `${Math.random() * 40 + 5}%`;
      cloud.style.left = `${Math.random() * 80}%`;
      cloud.style.opacity = Math.random() * 0.6 + 0.4;
      cloud.style.transform = `scale(${Math.random() * 0.5 + 0.5})`;
      cloud.style.animationDuration = `${Math.random() * 20 + 40}s`;
      
      container.appendChild(cloud);
    }
  };
  
  const createFog = () => {
    const container = containerRef.current;
    
    for (let i = 0; i < 3; i++) {
      const fogLayer = document.createElement('div');
      fogLayer.className = 'fog-layer';
      
      fogLayer.style.opacity = i === 0 ? '0.7' : i === 1 ? '0.5' : '0.3';
      fogLayer.style.top = `${i * 20}%`;
      fogLayer.style.animationDuration = `${i * 5 + 20}s`;
      fogLayer.style.animationDirection = i % 2 === 0 ? 'normal' : 'reverse';
      
      container.appendChild(fogLayer);
    }
  };
  
  const createSunRays = () => {
    const container = containerRef.current;
    
    // Create sun
    const sun = document.createElement('div');
    sun.className = 'sun';
    container.appendChild(sun);
    
    // Create rays
    for (let i = 0; i < 12; i++) {
      const ray = document.createElement('div');
      ray.className = 'sun-ray';
      
      ray.style.transform = `rotate(${i * 30}deg)`;
      ray.style.animationDelay = `${i * 0.1}s`;
      
      sun.appendChild(ray);
    }
  };
  
  return (
    <motion.div 
      className="weather-animation-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="weather-animation-container" ref={containerRef}></div>
    </motion.div>
  );
};

export default WeatherAnimation; 