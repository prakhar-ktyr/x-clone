const express = require('express');
const router = express.Router();
const Tweet = require('../models/tweet');
const auth = require('../middleware/auth');

// CREATE: Add a new tweet
router.post('/', auth, async (req, res) => {
  const { content } = req.body;

  try {
    const newTweet = new Tweet({
      content,
      author: req.user.id,
    });

    await newTweet.save();
    res.status(201).json(newTweet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// READ: Get all tweets
router.get('/', async (req, res) => {
  try {
    const tweets = await Tweet.find().populate('author', 'name handle').populate('comments');
    res.json(tweets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ: Get a tweet by ID
router.get('/:id', async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id).populate('author', 'name handle').populate('comments');
    if (!tweet) return res.status(404).json({ message: 'Tweet not found' });
    res.json(tweet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE: Update a tweet by ID
router.put('/:id', auth, async (req, res) => {
  const { content } = req.body;

  try {
    const tweet = await Tweet.findById(req.params.id);
    if (!tweet) return res.status(404).json({ message: 'Tweet not found' });

    if (tweet.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to update this tweet' });
    }

    tweet.content = content || tweet.content;
    await tweet.save();
    res.json(tweet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE: Delete a tweet by ID
router.delete('/:id', auth, async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    if (!tweet) return res.status(404).json({ message: 'Tweet not found' });

    if (tweet.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to delete this tweet' });
    }

    await tweet.remove();
    res.json({ message: 'Tweet deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
