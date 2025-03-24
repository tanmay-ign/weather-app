const express = require('express');

console.log('Starting minimal server...');

// Create express app
const app = express();
const PORT = 5000;

// Test route
app.get('/test', (req, res) => {
  console.log('Test route accessed');
  res.json({ success: true, message: 'Minimal server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Minimal server running on port ${PORT}`);
  console.log(`Try accessing: http://localhost:${PORT}/test`);
}); 