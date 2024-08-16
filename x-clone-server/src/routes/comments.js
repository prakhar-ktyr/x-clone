const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');
const Tweet = require('../models/tweet');
const auth = require('../middleware/auth');

// CREATE: Add a new comment
router.post('/:tweetId', auth, async (req, res) => {
  const { content } = req.body;
  const { tweetId } = req.params;

  try {
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    let newComment = new Comment({
      content,
      author: req.user.id,
      tweet: tweetId
    });

    // Save the comment first
    await newComment.save();

    // Populate the author field after saving the comment
    await newComment.populate('author', 'name handle profilePicture');

    // Add comment to tweet's comments array
    tweet.comments.push(newComment._id);
    await tweet.save();

    res.status(201).json(newComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/// READ: Get all comments for a tweet
router.get('/:tweetId', auth, async (req, res) => {
  const { tweetId } = req.params;

  try {
    const tweet = await Tweet.findById(tweetId).populate({
      path: 'comments',
      populate: {
        path: 'author',
        select: 'name handle profilePicture' // Include profilePicture
      }
    });

    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    res.json(tweet.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// UPDATE: Update a comment by ID
router.put('/:commentId', auth, async (req, res) => {
  const { content } = req.body;
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to update this comment' });
    }

    comment.content = content || comment.content;
    await comment.save();

    res.json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE: Delete a comment by ID
router.delete('/:commentId', auth, async (req, res) => {
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to delete this comment' });
    }

    await comment.remove();

    // Remove comment from the tweet's comments array
    await Tweet.findByIdAndUpdate(comment.tweet, {
      $pull: { comments: commentId }
    });

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
