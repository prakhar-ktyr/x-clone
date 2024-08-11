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
const path = require('path');

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
app.use('/api/comments', commentRoute); // Add comment routes

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

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
