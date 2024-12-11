// // server.js
// const express = require('express');
// const app = express();
// const yf = require('yahoo-finance2').default; // after installing yahoo-finance2

// // Allow cross-origin requests if you're running the frontend on a different port
// const cors = require('cors');
// app.use(cors());

// // Example endpoint: /api/history?ticker=AAPL&range=10y
// app.get('/api/history', async (req, res) => {
//   const ticker = req.query.ticker || 'AAPL';
//   const range = req.query.range || '10y';

//   try {
//     // yahoo-finance2 example: `historical()` fetches historical data
//     // range example: '10y' means 10 years. 
//     // For yahoo-finance2, you specify periods differently, e.g., { period1: '2013-01-01', period2: '2023-01-01' } or use interval options.
    
//     // Let's assume we map '10y' to a suitable start date:
//     const now = new Date();
//     const start = new Date();
//     start.setFullYear(now.getFullYear() - 10);
    
//     const results = await yf.historical(ticker, {
//       period1: start,
//       period2: now,
//       interval: '1d'
//     });
    
//     // results is an array of objects like: { date, open, high, low, close, volume }
//     // Extract the dates and closing prices:
//     const dates = results.map(entry => entry.date.toISOString().split('T')[0]);
//     const prices = results.map(entry => entry.close);
    
//     res.json({ dates, prices });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to fetch data' });
//   }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Backend server running on port ${PORT}`);
// });
// const express = require('express');
// const path = require('path');

// const app = express();

// // Serve the backend API routes
// app.get('/api/history', (req, res) => {
//   // return your JSON data here
// });

// // Serve the React static files
// app.use(express.static(path.join(__dirname, 'build')));

// // For any request not handled by the above, serve index.html
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));


// const express = require('express');
// const path = require('path');
// const app = express();

// // API routes go here
// app.get('/api/history', (req, res) => {
//   // return JSON data
// });

// // Serve React build
// app.use(express.static(path.join(__dirname, '..', 'build')));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// const express = require('express');
// const cors = require('cors');

// const app = express();
// app.use(cors()); // Allow all origins (or specify origin if needed)

// // Your API routes
// app.get('/api/history', (req, res) => {
//   // Return JSON data
//   //res.json({ dates: [...], prices: [...] });
//   res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


const path = require('path');
app.use(express.static(path.join(__dirname, '..', 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});
