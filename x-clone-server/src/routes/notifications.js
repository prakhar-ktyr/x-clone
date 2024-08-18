const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/notification');

// Get the latest 20 notifications for the logged-in user
// Ensure the sender field is populated when fetching notifications
router.get('/', auth, async (req, res) => {
    try {
      const notifications = await Notification.find({ recipient: req.user.id })
        .populate('sender', 'handle profilePicture')  // Populate the sender's handle
        .sort({ createdAt: -1 })
        .limit(20);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});
  

module.exports = router;
