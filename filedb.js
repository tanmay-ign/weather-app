const fs = require('fs');
const path = require('path');

// Database file path
const DB_FILE = path.join(__dirname, 'weatherdb.json');

console.log('Initializing file database at:', DB_FILE);

// Initialize the database if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  console.log('Database file does not exist, creating it now...');
  fs.writeFileSync(DB_FILE, JSON.stringify({ weather: [] }, null, 2));
  console.log('Database file created successfully');
} else {
  console.log('Using existing database file');
}

// File database operations
const fileDB = {
  // Find one record
  findOne: async (collection, query) => {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      if (!data[collection]) return null;
      
      // Find matching record
      return data[collection].find(record => {
        return Object.keys(query).every(key => {
          if (query[key] instanceof RegExp) {
            return query[key].test(record[key]);
          } else if (key === 'createdAt' && query[key].$gt) {
            return new Date(record[key]) > query[key].$gt;
          } else {
            return record[key] === query[key];
          }
        });
      });
    } catch (err) {
      console.error('File DB error:', err);
      return null;
    }
  },
  
  // Save a record
  save: async (collection, data) => {
    try {
      const dbData = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      if (!dbData[collection]) dbData[collection] = [];
      
      // Add ID and timestamp
      const newRecord = {
        ...data,
        _id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      
      dbData[collection].push(newRecord);
      
      // Limit collection size
      if (dbData[collection].length > 20) {
        dbData[collection] = dbData[collection].slice(-20);
      }
      
      fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2));
      return newRecord;
    } catch (err) {
      console.error('File DB save error:', err);
      return data;
    }
  },
  
  // Find multiple records
  find: async (collection) => {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      if (!data[collection]) return [];
      
      return {
        sort: (sortOptions) => {
          const sortKey = Object.keys(sortOptions)[0];
          const sortDir = sortOptions[sortKey];
          
          const sorted = [...data[collection]].sort((a, b) => {
            if (sortDir === -1) {
              return new Date(b[sortKey]) - new Date(a[sortKey]);
            } else {
              return new Date(a[sortKey]) - new Date(b[sortKey]);
            }
          });
          
          return {
            limit: (limit) => {
              const limited = sorted.slice(0, limit);
              return {
                select: (fields) => {
                  return limited.map(item => {
                    const result = {};
                    Object.keys(fields).forEach(field => {
                      if (fields[field] === 1) {
                        result[field] = item[field];
                      }
                    });
                    return result;
                  });
                }
              };
            }
          };
        }
      };
    } catch (err) {
      console.error('File DB find error:', err);
      return [];
    }
  }
};

module.exports = fileDB; 