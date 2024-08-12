const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const Tweet = require('../models/tweet');
const auth = require('../middleware/auth');

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename file to avoid conflicts
  },
});

const upload = multer({ storage: storage });

// CREATE: Add a new tweet with file uploads
router.post('/', auth, upload.fields([{ name: 'images', maxCount: 5 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
  const { content } = req.body;
  let imagePaths = [];
  let videoPath = '';

  if (req.files.images) {
    imagePaths = req.files.images.map(file => file.path);
  }

  if (req.files.video) {
    videoPath = req.files.video[0].path;
  }

  try {
    const newTweet = new Tweet({
      content,
      author: req.user.id,
      images: imagePaths,
      video: videoPath,
    });

    await newTweet.save();
    res.status(201).json(newTweet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// READ: Get all tweets
router.get('/', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id; // Get the current user's ID

    const tweets = await Tweet.find()
      .populate('author', 'name handle followers')
      .populate('comments')
      .populate('likes')
      .populate('retweets');

    // Add an isFollowing field to each author object
    const tweetsWithFollowInfo = tweets.map(tweet => {
      const isFollowing = tweet.author.followers.some(followerId => followerId.toString() === currentUserId);
      return {
        ...tweet._doc,
        author: {
          ...tweet.author._doc,
          isFollowing: isFollowing
        }
      };
    });

    res.json(tweetsWithFollowInfo);
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
