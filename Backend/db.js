// Backend/index.js

const express = require('express');
const http = require('http'); // NEW: Needed for Socket.io
const { Server } = require('socket.io'); // NEW: Import Socket.io
const cors = require('cors'); // Recommended for frontend connection

require('dotenv').config();

const usersRouter = require('./routes/users');
const serversRouter = require('./routes/servers');
const channelsRouter = require('./routes/channels');
const messagesRouter = require('./routes/messages');

const app = express();
const server = http.createServer(app); // Wrap Express

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow your Frontend to connect
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors()); // Allow requests from React
app.use(express.json());

const PORT = process.env.PORT || 5000;

// --- SOCKET.IO LOGIC ---
io.on('connection', (socket) => {
  console.log('⚡ A user connected:', socket.id);

  // Join a specific channel room
  socket.on('join_channel', (channelId) => {
    socket.join(channelId);
    console.log(`User ${socket.id} joined channel: ${channelId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make 'io' accessible in our routes (so messages.js can emit events)
app.set('socketio', io);

// --- Routes ---
app.get('/', (req, res) => {
  res.send('Welcome to the API Lobby!');
});

app.use('/api/users', usersRouter);
app.use('/api/servers', serversRouter);
app.use('/api/servers/:serverId/channels', channelsRouter);
app.use('/api/channels/:channelId/messages', messagesRouter);

// IMPORTANT: Change app.listen to server.listen
server.listen(PORT, () => {
  console.log(`Server (HTTP + Socket) is running on http://localhost:${PORT}`);
});
