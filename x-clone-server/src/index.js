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
app.use('/api/follow', followRoute);
app.use('/api/tweets', tweetRoute);
app.use('/api/comments', commentRoute); 
app.use('/api/chat', chatRoute);

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
    origin: "*", // Adjust this according to your needs
    methods: ["GET", "POST"]
  }
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for a message event
  socket.on('message', (data) => {
    console.log('Message received:', data);
    // Broadcast the message to all connected clients
    io.emit('message', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
