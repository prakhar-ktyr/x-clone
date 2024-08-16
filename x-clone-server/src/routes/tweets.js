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
// READ: Get all tweets with pagination
router.get('/', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id.toString(); // Ensure currentUserId is a string
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 15; // Default to 15 tweets per page

    const tweets = await Tweet.find()
      .populate('author', 'name handle followers profilePicture')
      .populate('comments')
      .populate('likes')
      .populate('retweets')
      .sort({ createdAt: -1 }) // Sort by newest tweets
      .skip((page - 1) * limit)
      .limit(limit);

    // Add isFollowing and isLiked fields to each tweet object
    const tweetsWithFollowAndLikeInfo = tweets.map(tweet => {
      const isFollowing = tweet.author.followers.some(followerId => followerId.toString() === currentUserId);
      const isLiked = tweet.likes.some(like => like._id.toString() === currentUserId); // Ensure _id is compared as a string
      return {
        ...tweet._doc,
        author: {
          ...tweet.author._doc,
          isFollowing: isFollowing
        },
        isLiked: isLiked
      };
    });

    res.json(tweetsWithFollowAndLikeInfo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ: Get tweets by the logged-in user
router.get('/user', auth, async (req, res) => {
  try {
    const tweets = await Tweet.find({ author: req.user.id })
      .populate('author', 'name handle')
      .populate('comments')
      .populate('likes')
      .populate('retweets');
    res.json(tweets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ: Get tweets by a specific user ID
router.get('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const tweets = await Tweet.find({ author: userId })
      .populate('author', 'name handle profilePicture')
      .populate('comments')
      .populate('likes')
      .populate('retweets');
    res.json(tweets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/like/:id', auth, async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    if (!tweet) {
      return res.status(404).json({ success: false, message: 'Tweet not found' });
    }
    if (!tweet.likes.includes(req.user.id)) {
      tweet.likes.push(req.user.id);
      await tweet.save();
      res.status(200).json({ success: true, tweet });  // Return the updated tweet
    } else {
      res.status(400).json({ success: false, message: 'Tweet already liked' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/unlike/:id', auth, async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    if (!tweet) {
      return res.status(404).json({ success: false, message: 'Tweet not found' });
    }
    tweet.likes = tweet.likes.filter(id => id.toString() !== req.user.id);
    await tweet.save();
    res.status(200).json({ success: true, tweet });  // Return the updated tweet
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// READ: Get a tweet by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id.toString(); // Ensure currentUserId is a string

    const tweet = await Tweet.findById(req.params.id)
      .populate('author', 'name handle followers profilePicture')
      .populate('comments')
      .populate('likes')
      .populate('retweets');

    if (!tweet) return res.status(404).json({ message: 'Tweet not found' });

    const isFollowing = tweet.author.followers.some(followerId => followerId.toString() === currentUserId);
    const isLiked = tweet.likes.some(like => like._id.toString() === currentUserId); // Ensure _id is compared as a string

    const tweetWithFollowAndLikeInfo = {
      ...tweet._doc,
      author: {
        ...tweet.author._doc,
        isFollowing: isFollowing
      },
      isLiked: isLiked
    };

    res.json(tweetWithFollowAndLikeInfo);
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
