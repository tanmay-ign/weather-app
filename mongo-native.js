const { MongoClient } = require('mongodb');

// Connection URI
const uri = "mongodb+srv://tanmayupadhyay2005:tanmay@joker.emna4.mongodb.net/?retryWrites=true&w=majority&appName=Joker";

// Create a new MongoClient
const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000
});

// Connect function
async function connectNative() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB using native driver");
    
    // Get a reference to the database
    const db = client.db("weatherApp");
    
    return db;
  } catch (err) {
    console.error("Failed to connect using MongoDB native driver:", err);
    throw err;
  }
}

// Export the client and connect function
module.exports = { client, connectNative }; 