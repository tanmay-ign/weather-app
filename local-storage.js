const fs = require('fs');
const path = require('path');

// Path to JSON file
const DB_FILE = path.join(__dirname, 'weather-data.json');

// Initialize the database file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ weather: [] }));
}

// Helper functions for working with the JSON file
const readDB = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading from local DB:', error);
    return { weather: [] };
  }
};

const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing to local DB:', error);
    return false;
  }
}; 