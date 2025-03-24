const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Simple MongoDB connection test
const uri = "mongodb+srv://tanmayupadhyay2005:tanmay@joker.emna4.mongodb.net/weatherApp?retryWrites=true&w=majority";

console.log("Testing MongoDB connection...");
console.log('MongoDB URI:', uri);

async function testMongoConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MongoDB URI:', process.env.MONGO_URI);
    
    // Connection options
    const options = {
      useNewUrlParser: true,
      useUn
  }
} 