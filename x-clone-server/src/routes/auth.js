const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();
const secret = process.env.JWT_SECRET;

// Sign up route
router.post('/signup', async (req, res) => {
  const { name, email, password, handle } = req.body;

  try {
    // Check if the email already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Check if the handle already exists
    user = await User.findOne({ handle });
    if (user) {
      return res.status(400).json({ message: 'Handle already exists' });
    }

    // Create a new user
    user = new User({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      handle
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, secret, { expiresIn: '1h' });

    res.status(201).json({ token, user: { id: user._id, name, email, handle } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, secret, { expiresIn: '1h' });

    res.json({ token, user: { id: user._id, name: user.name, email, handle: user.handle } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
