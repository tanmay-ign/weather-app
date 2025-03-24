const fs = require('fs');
const path = require('path');

// Create a local JSON file database
const DB_PATH = path.join(__dirname, 'db.json');

// Initialize DB file if it doesn't exist
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ weather: [] }));
}

// Simple local database operations
const localDb = {
  findOne: async (collection, query) => {
    const data = JSON.parse(fs.readFileSync(DB_PATH));
    if (!data[collection]) return null;
    
    // Find item that matches all query conditions
    return data[collection].find(item => {
      for (const [key, value] of Object.entries(query)) {
        // Handle special query operators
        if (key === 'city' && value instanceof RegExp) {
          if (!value.test(item[key])) return false;
        } 
        // Handle date comparisons
        else if (key === 'createdAt' && typeof value === 'object') {
          if (value.$gt && new Date(item[key]) <= new Date(value.$gt)) return false;
        }
        // Simple equality check
        else if (item[key] !== value) {
          return false;
        }
      }
      return true;
    });
  },
  
  find: async (collection, query = {}) => {
    const data = JSON.parse(fs.readFileSync(DB_PATH));
    if (!data[collection]) return [];
    
    // Find items that match query
    let results = data[collection].filter(item => {
      for (const [key, value] of Object.entries(query)) {
        if (item[key] !== value) return false;
      }
      return true;
    });
    
    return {
      sort: (sortOptions) => {
        const [field, order] = Object.entries(sortOptions)[0];
        results.sort((a, b) => {
          if (field === 'createdAt') {
            return order === -1 
              ? new Date(b.createdAt) - new Date(a.createdAt)
              : new Date(a.createdAt) - new Date(b.createdAt);
          }
          return order === -1 
            ? String(b[field]).localeCompare(String(a[field]))
            : String(a[field]).localeCompare(String(b[field]));
        });
        return {
          limit: (n) => {
            results = results.slice(0, n);
            return {
              toArray: async () => results
            };
          }
        };
      }
    };
  },
  
  insertOne: async (collection, doc) => {
    const data = JSON.parse(fs.readFileSync(DB_PATH));
    if (!data[collection]) data[collection] = [];
    
    // Add ID and timestamps
    const newDoc = {
      ...doc,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    data[collection].push(newDoc);
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    
    return { insertedId: newDoc._id };
  }
};

module.exports = localDb; 