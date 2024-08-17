const express = require('express');
const router = express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');
const Notification = require('../models/notification');

// Follow a user
router.post('/follow/:id', auth, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      return res.status(404).json({ message: 'User to follow not found' });
    }

    if (currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ message: 'You are already following this user' });
    }

    currentUser.following.push(userToFollow._id);
    userToFollow.followers.push(currentUser._id);

    await currentUser.save();
    await userToFollow.save();

    // Create a notification
    const notification = new Notification({
      type: 'follow',
      sender: currentUser._id,
      recipient: userToFollow._id,
    });
    await notification.save();

    // Emit the notification event to the recipient via WebSocket
    const recipientSocketId = req.activeUsers.get(userToFollow._id.toString());
    if (recipientSocketId) {
      req.io.to(recipientSocketId).emit('notification', notification);
    }

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Unfollow a user
router.post('/unfollow/:id', auth, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User to unfollow not found' });
    }

    currentUser.following = currentUser.following.filter(
      (userId) => userId.toString() !== req.params.id
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (userId) => userId.toString() !== req.user.id
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
