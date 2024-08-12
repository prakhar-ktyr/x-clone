const express = require('express');
const multer = require('multer');
const router = express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');

// Test route for logging
router.get('/test', (req, res) => {
  console.log('Test route hit'); // Add this line
  res.send('Test route working');
});

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${req.user.id}-${file.originalname}`);
  }
});
const upload = multer({ storage: storage });

// Profile picture upload route
router.post('/upload-profile-picture', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profilePicture = req.file.path;
    await user.save();

    res.json({ message: 'Profile picture uploaded successfully', profilePicture: req.file.path });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get the authenticated user's profile
router.get('/me', auth, async (req, res) => {
  try {
    console.log('Entering /me route');
    console.log('User ID from token:', req.user.id);

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      console.log('User not found for ID:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', user);
    res.json(user);
  } catch (error) {
    console.error('Error in /me route:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Get user profile by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/', auth, async (req, res) => {
  const { name, bio, website, location } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.bio = bio || user.bio;
    user.website = website || user.website;
    user.location = location || user.location;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
