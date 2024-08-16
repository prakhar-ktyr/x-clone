const jwt = require('jsonwebtoken');
const User = require('../models/user');
const secret = process.env.JWT_SECRET;

const auth = async (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }

  try {
    const actualToken = token.startsWith('Bearer ') ? token.slice(7, token.length).trimLeft() : token;
    const decoded = jwt.verify(actualToken, secret);
    console.log('Decoded token:', decoded);

    // Fetch the full user profile, including bookmarks
    const user = await User.findById(decoded.id).populate('bookmarks');
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log('Invalid token:', error.message);
    res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = auth;
