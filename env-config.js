const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Path to .env file
const envPath = path.resolve(__dirname, '.env');

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.error('.env file not found at:', envPath);
  console.error('Creating a default .env file...');
  
  // Create default .env content
  const defaultEnvContent = `PORT=5000
MONGO_URI=mongodb+srv://tanmayupadhyay2005:tanmay@joker.emna4.mongodb.net/weatherApp?retryWrites=true&w=majority&appName=Joker
WEATHER_API_KEY=151555f2a689822a727ddda090630e13`;
  
  // Write default .env file
  fs.writeFileSync(envPath, defaultEnvContent);
  console.log('Default .env file created at:', envPath);
}

// Load environment variables
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env file:', result.error);
}

// Verify environment variables
const requiredVars = ['PORT', 'MONGO_URI', 'WEATHER_API_KEY'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars.join(', '));
  console.error('Current environment variables:', process.env);
}

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  weatherApiKey: process.env.WEATHER_API_KEY
}; 