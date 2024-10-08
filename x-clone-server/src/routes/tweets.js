const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const User = require('../models/user');
const Tweet = require('../models/tweet');
const Notification = require('../models/notification');
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

  // Extract hashtags from the content
  const hashtags = content.match(/#[a-zA-Z0-9_]+/g) || []; // Match words starting with #
  const normalizedTags = hashtags.map(tag => tag.toLowerCase()); // Normalize tags to lowercase

  try {
    const newTweet = new Tweet({
      content,
      author: req.user.id,
      images: imagePaths,
      video: videoPath,
      tags: normalizedTags, // Store the normalized hashtags
    });

    await newTweet.save();
    res.status(201).json(newTweet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const currentUserId = req.user._id.toString(); // Ensure currentUserId is a string
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 15; // Default to 15 tweets per page

    // Fetch tweets with pagination, excluding the user's own tweets
    const tweets = await Tweet.find({ author: { $ne: currentUserId } })
      .populate('author', 'name handle followers profilePicture')
      .populate('comments')
      .populate('likes')
      .populate('retweets')
      .sort({ createdAt: -1 }) // Sort by newest tweets
      .skip((page - 1) * limit)
      .limit(limit);

    // Map bookmarks to an array of strings (tweet IDs)
    const bookmarkIds = req.user.bookmarks ? req.user.bookmarks.map(b => b._id.toString()) : [];

    // Add isFollowing, isLiked, isBookmarked, and isRetweeted fields to each tweet object
    const tweetsWithInfo = tweets.map(tweet => {
      const tweetIdStr = tweet._id.toString();
      const isFollowing = tweet.author.followers.some(followerId => followerId.toString() === currentUserId);
      const isLiked = tweet.likes.some(like => like._id.toString() === currentUserId); // Ensure _id is compared as a string
      const isBookmarked = bookmarkIds.includes(tweetIdStr);  // Check if the tweet is bookmarked
      const isRetweeted = tweet.retweets.some(retweetId => retweetId._id.toString() === currentUserId);  // Check if the tweet is retweeted

      return {
        ...tweet._doc,
        author: {
          ...tweet.author._doc,
          isFollowing: isFollowing
        },
        isLiked: isLiked,
        isBookmarked: isBookmarked,  // Include bookmark status
        isRetweeted: isRetweeted  // Include retweet status
      };
    });

    res.json(tweetsWithInfo);
  } catch (error) {
    console.error('Error in fetching tweets:', error);
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

// READ: Get retweets by the logged-in user
router.get('/retweets', auth, async (req, res) => {
  try {
    const tweets = await Tweet.find({ retweets: req.user.id })
      .populate('author', 'name handle profilePicture')
      .populate('comments')
      .populate('likes')
      .populate('retweets')
      .sort({ createdAt: -1 });
    console.log('Retweets:', tweets);
    res.json(tweets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// SEARCH: Search for tweets by content or hashtags
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query; // Get the search query from the URL
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    // Search for tweets that match the query in content or tags
    const tweets = await Tweet.find({
      $text: { $search: query }
    })
    .populate('author', 'name handle followers profilePicture')
    .populate('comments')
    .populate('likes')
    .populate('retweets')
    .sort({ createdAt: -1 });

    res.json(tweets);
  } catch (error) {
    console.error('Error in searching tweets:', error);
    res.status(500).json({ message: error.message });
  }
});

// Fetch the top 15 hashtags from the last week
router.get('/trending-hashtags', async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const trendingHashtags = await Tweet.aggregate([
      { $match: { createdAt: { $gte: oneWeekAgo } } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);

    res.json(trendingHashtags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/following', auth, async (req, res) => {
  try {
    const currentUserId = req.user._id.toString(); // Ensure currentUserId is a string
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 15; // Default to 15 tweets per page

    // Fetch the current user's following list
    const user = await User.findById(currentUserId).select('following');
    const followingIds = user.following.map(id => id.toString());

    // Fetch tweets from the users the current user is following
    const tweets = await Tweet.find({ author: { $in: followingIds } })
      .populate('author', 'name handle followers profilePicture')
      .populate('comments')
      .populate('likes')
      .populate('retweets')
      .sort({ createdAt: -1 }) // Sort by newest tweets
      .skip((page - 1) * limit)
      .limit(limit);

    // Map bookmarks to an array of strings (tweet IDs)
    const bookmarkIds = req.user.bookmarks ? req.user.bookmarks.map(b => b._id.toString()) : [];

    // Add isLiked, isBookmarked, and isRetweeted fields to each tweet object
    const tweetsWithInfo = tweets.map(tweet => {
      const tweetIdStr = tweet._id.toString();
      const isLiked = tweet.likes.some(like => like._id.toString() === currentUserId); // Ensure _id is compared as a string
      const isBookmarked = bookmarkIds.includes(tweetIdStr);  // Check if the tweet is bookmarked
      const isRetweeted = tweet.retweets.some(retweetId => retweetId._id.toString() === currentUserId);  // Check if the tweet is retweeted

      return {
        ...tweet._doc,
        isLiked: isLiked,
        isBookmarked: isBookmarked,  // Include bookmark status
        isRetweeted: isRetweeted  // Include retweet status
      };
    });

    res.json(tweetsWithInfo);
  } catch (error) {
    console.error('Error in fetching following tweets:', error);
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

// Like a tweet
router.post('/like/:id', auth, async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    if (!tweet) {
      return res.status(404).json({ success: false, message: 'Tweet not found' });
    }
    if (!tweet.likes.includes(req.user.id)) {
      tweet.likes.push(req.user.id);
      await tweet.save();

      // Create a notification
      let notification = new Notification({
        type: 'like',
        sender: req.user.id,
        recipient: tweet.author,
        tweet: tweet._id
      });

      // Populate the sender's information
      notification = await notification.populate('sender', 'handle profilePicture');

      await notification.save();

      // Emit the notification event to the recipient via WebSocket
      const recipientSocketId = req.activeUsers.get(tweet.author.toString());
      if (recipientSocketId) {
        req.io.to(recipientSocketId).emit('notification', notification);
      }

      res.status(200).json({ success: true, tweet });
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

// Bookmark a tweet
router.post('/bookmark/:id', auth, async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!tweet || !user) {
      return res.status(404).json({ message: 'Tweet or User not found' });
    }

    if (!user.bookmarks.includes(tweet._id)) {
      user.bookmarks.push(tweet._id);
      await user.save();
      res.status(200).json({ success: true, message: 'Tweet bookmarked' });
    } else {
      res.status(400).json({ success: false, message: 'Tweet already bookmarked' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Unbookmark a tweet
router.post('/unbookmark/:id', auth, async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!tweet || !user) {
      return res.status(404).json({ message: 'Tweet or User not found' });
    }

    user.bookmarks = user.bookmarks.filter(bookmark => bookmark.toString() !== tweet._id.toString());
    await user.save();
    res.status(200).json({ success: true, message: 'Tweet unbookmarked' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ: Get all bookmarked tweets by the logged-in user
router.get('/bookmarks', auth, async (req, res) => {
  try {
    const user = req.user;

    const tweets = await Tweet.find({
      _id: { $in: user.bookmarks }
    })
      .populate('author', 'name handle followers profilePicture')
      .populate('comments')
      .populate('likes')
      .populate('retweets')
      .sort({ createdAt: -1 }); // Sort by newest tweets

    res.json(tweets);
  } catch (error) {
    console.error('Error fetching bookmarked tweets:', error);
    res.status(500).json({ message: error.message });
  }
});

// Retweet a tweet
router.post('/retweet/:id', auth, async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!tweet || !user) {
      return res.status(404).json({ message: 'Tweet or User not found' });
    }

    if (!tweet.retweets.includes(user._id)) {
      tweet.retweets.push(user._id);
      await tweet.save();

      // Create a notification
      let notification = new Notification({
        type: 'retweet',
        sender: user._id,
        recipient: tweet.author,
        tweet: tweet._id
      });

      // Populate the sender's information
      notification = await notification.populate('sender', 'handle profilePicture');

      await notification.save();

      // Emit the notification event to the recipient via WebSocket
      const recipientSocketId = req.activeUsers.get(tweet.author.toString());
      if (recipientSocketId) {
        req.io.to(recipientSocketId).emit('notification', notification);
      }

      res.status(200).json({ success: true, tweet });
    } else {
      res.status(400).json({ success: false, message: 'Tweet already retweeted' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/unretweet/:id', auth, async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!tweet || !user) {
      return res.status(404).json({ message: 'Tweet or User not found' });
    }

    tweet.retweets = tweet.retweets.filter(retweetId => retweetId.toString() !== user._id.toString());
    await tweet.save();
    res.status(200).json({ success: true, tweet });
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
