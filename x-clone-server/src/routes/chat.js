const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const auth = require('../middleware/auth');

// GET: Fetch list of users with whom the logged-in user has chat history
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all unique users that the logged-in user has had conversations with
    const messages = await Message.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    }).populate('sender', 'name profilePicture')
      .populate('receiver', 'name profilePicture');

    // Get unique user IDs from the messages
    const uniqueUsers = {};
    messages.forEach(message => {
      const otherUser = message.sender._id.toString() === userId ? message.receiver : message.sender;
      if (!uniqueUsers[otherUser._id.toString()]) {
        uniqueUsers[otherUser._id.toString()] = {
          userId: otherUser._id,
          name: otherUser.name,
          profilePicture: otherUser.profilePicture,
        };
      }
    });

    res.json(Object.values(uniqueUsers));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET: Fetch chat messages between two users
router.get('/:userId', auth, async (req, res) => {
  const { userId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: userId },
        { sender: userId, receiver: req.user.id }
      ]
    }).sort({ createdAt: 1 }); // Sort messages by creation time

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET: Fetch chat history between two specific users
router.get('/history/:userId1/:userId2', auth, async (req, res) => {
  const { userId1, userId2 } = req.params;
  
  try {
    const messages = await Message.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 }
      ]
    }).sort('createdAt');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: Send a new message
router.post('/', auth, async (req, res) => {
  const { receiver, content } = req.body;

  try {
    const message = new Message({
      sender: req.user.id,
      receiver,
      content,
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
