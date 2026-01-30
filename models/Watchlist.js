const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure unique user-auction combination
watchlistSchema.index({ user: 1, auction: 1 }, { unique: true });

module.exports = mongoose.model('Watchlist', watchlistSchema);
