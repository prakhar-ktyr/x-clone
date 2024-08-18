const mongoose = require('mongoose');
require('./comment'); // Ensure the Comment model is required

const tweetSchema = new mongoose.Schema({
  content: { type: String, required: true, maxlength: 280 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  retweets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  images: [{ type: String }], // Array of image file paths
  video: { type: String },    // Single video file path
  tags: [{ type: String }],    // Array of hashtags
  createdAt: { type: Date, default: Date.now },
});

// Create a text index on the content and tags fields
tweetSchema.index({ content: 'text', tags: 'text' });

module.exports = mongoose.model('Tweet', tweetSchema);
