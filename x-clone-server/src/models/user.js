const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  handle: { type: String, required: true, unique: true },
  bio: String,
  website: String,
  location: String,
  profilePicture: { type: String, default: 'uploads/default-profile.png' }, // Default profile picture path
  joined: { type: Date, default: Date.now },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tweet'}]
});

module.exports = mongoose.model('User', userSchema);
