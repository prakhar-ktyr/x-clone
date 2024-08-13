const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const auth = require('../middleware/auth');

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
