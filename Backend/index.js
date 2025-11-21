// backend/index.js

const express = require('express');
require('dotenv').config(); // Still need this for the PORT

// Import our routers
const usersRouter = require('./routes/users');
const serversRouter = require('./routes/servers');
const channelsRouter = require('./routes/channels')

const app = express();

// Middleware to read JSON
app.use(express.json());

const PORT = process.env.PORT || 5000;

// --- Routes ---
app.get('/', (req, res) => {
  res.send('Welcome to the API Lobby!');
});

// Connect our "User" desk
app.use('/api/users', usersRouter);
app.use('/api/servers', serversRouter);
app.use('/api/servers/:serverId/channels', channelsRouter);


// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
