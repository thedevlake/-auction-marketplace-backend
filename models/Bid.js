const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: true
  },
  bidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bidAmount: {
    type: Number,
    required: [true, 'Bid amount is required'],
    min: [0, 'Bid amount must be positive']
  },
  isAutoBid: {
    type: Boolean,
    default: false
  },
  maxBid: {
    type: Number,
    min: [0, 'Max bid must be positive']
  },
  isWinning: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
bidSchema.index({ auction: 1, createdAt: -1 });
bidSchema.index({ bidder: 1 });

module.exports = mongoose.model('Bid', bidSchema);
