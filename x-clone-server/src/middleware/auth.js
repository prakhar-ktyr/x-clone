const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

const auth = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    console.log('No token provided'); // Add this line
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }

  try {
    const actualToken = token.startsWith('Bearer ') ? token.slice(7, token.length).trimLeft() : token;
    const decoded = jwt.verify(actualToken, secret);
    console.log('Decoded token:', decoded); // Add this line
    req.user = decoded;
    next();
  } catch (error) {
    console.log('Invalid token'); // Add this line
    res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = auth;
