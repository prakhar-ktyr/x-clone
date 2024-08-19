require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const usersRoute = require('./routes/users');
const authRoute = require('./routes/auth');
const profileRoute = require('./routes/profile');
const followRoute = require('./routes/follow');
const tweetRoute = require('./routes/tweets');
const commentRoute = require('./routes/comments');
const chatRoute = require('./routes/chat');
const notificationRoute = require('./routes/notifications');
const path = require('path');
const http = require('http'); 
const { Server } = require('socket.io'); 

const app = express();
const port = 3000;

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use('/api/users', usersRoute);
app.use('/api/auth', authRoute);
app.use('/api/profile', profileRoute);
// Pass `io` and `activeUsers` to routes
app.use('/api/follow', (req, res, next) => {
  req.io = io;
  req.activeUsers = activeUsers;
  next();
}, followRoute);

app.use('/api/tweets', (req, res, next) => {
  req.io = io;
  req.activeUsers = activeUsers;
  next();
}, tweetRoute);
app.use('/api/comments', commentRoute); 
app.use('/api/chat', chatRoute);
app.use('/api/notifications', notificationRoute);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/x-clone', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Create an HTTP server and integrate Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store active users
let activeUsers = new Map();

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle user joining with their ID
  socket.on('joinRoom', (userId) => {
    activeUsers.set(userId, socket.id);
    console.log(`User ${userId} connected with socket ID ${socket.id}`);
  });

  // Listen for the sendMessage event
  socket.on('sendMessage', (message) => {
    const receiverSocketId = activeUsers.get(message.receiver);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receiveMessage', message);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    for (let [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});
// Start the server
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
