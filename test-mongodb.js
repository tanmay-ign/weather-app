const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Get MongoDB URI
const mongoURI = process.env.MONGO_URI;

console.log('MongoDB Connection Test');
console.log('======================');
console.log('Connection String:', mongoURI ? `${mongoURI.substring(0, 20)}...` : 'undefined');

// Connection options for maximum compatibility
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000,
  family: 4
};

// Test the MongoDB connection
async function testConnection() {
  console.log('\nAttempting to connect to MongoDB...');
  
  try {
    const conn = await mongoose.connect(mongoURI, options);
    console.log('\n✅ SUCCESS: MongoDB connection established!');
    console.log(`Connected to: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    console.log(`MongoDB Version: ${await conn.connection.db.admin().serverInfo().then(info => info.version)}`);
    
    // Create a test collection and document
    console.log('\nTesting data operations...');
    const TestModel = mongoose.model('ConnectionTest', new mongoose.Schema({
      testField: String,
      timestamp: { type: Date, default: Date.now }
    }));
    
    // Create test document
    const testDoc = new TestModel({ testField: 'Test Successful' });
    await testDoc.save();
    console.log('✅ Document created successfully');
    
    // Read test document
    const savedDoc = await TestModel.findOne({ testField: 'Test Successful' });
    console.log(`✅ Document retrieved successfully: ${savedDoc.testField}`);
    
    // Clean up - delete test document and collection
    await TestModel.deleteMany({});
    await mongoose.connection.db.dropCollection('connectiontests')
      .catch(err => console.log('Note: Collection cleanup failed, but this is not a problem.'));
    
    console.log('✅ Test cleanup completed');
    
    // Close connection
    await mongoose.connection.close();
    console.log('\nConnection closed successfully');
    
    return true;
  } catch (error) {
    console.error('\n❌ ERROR: MongoDB connection failed!');
    console.error(`Error Type: ${error.name}`);
    console.error(`Error Message: ${error.message}`);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('\nThis error usually means that MongoDB couldn\'t find the server.');
      console.error('Possible causes:');
      console.error('1. Invalid hostname or connection string');
      console.error('2. Network connectivity issues');
      console.error('3. MongoDB Atlas IP whitelist restrictions');
      console.error('4. MongoDB server is down');
    } else if (error.name === 'MongoParseError') {
      console.error('\nThis error means your connection string is invalid.');
      console.error('Please check the format of your MONGO_URI.');
    } else if (error.message.includes('authentication failed')) {
      console.error('\nAuthentication failed. Check your username and password.');
    }
    
    return false;
  }
}

// Run the test
testConnection()
  .then(success => {
    console.log('\nTest Completed');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error during test:', err);
    process.exit(1);
  }); 