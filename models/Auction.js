const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemName: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  images: {
    type: [String],
    validate: {
      validator: function(v) {
        return v.length <= 2;
      },
      message: 'Maximum 2 images allowed'
    }
  },
  category: {
    type: String,
    required: true,
    enum: ['Basic', 'Daily', 'Tech', 'Services', 'Collectibles', 'Digital', 'Fashion']
  },
  tags: [{
    type: String,
    enum: ['New', 'Trending', 'Ending Soon', 'High Demand', 'No Reserve', 'Buy Now']
  }],
  startingPrice: {
    type: Number,
    required: [true, 'Starting price is required'],
    min: [0, 'Starting price must be positive']
  },
  reservePrice: {
    type: Number,
    min: [0, 'Reserve price must be positive']
  },
  currentBid: {
    type: Number,
    default: 0
  },
  bidIncrement: {
    type: Number,
    required: [true, 'Bid increment is required'],
    min: [0.01, 'Bid increment must be at least 0.01']
  },
  highestBidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  numberOfBids: {
    type: Number,
    default: 0
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  status: {
    type: String,
    enum: ['upcoming', 'live', 'ended', 'won', 'unpaid', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  paymentDeadline: {
    type: Date
  },
  itemsAvailable: {
    type: Number,
    default: 1,
    min: 1
  },
  size: String,
  quantity: String,
  material: String,
  condition: String,
  deliveryInfo: String,
  returnsInfo: String,
  commonQuestions: [{
    question: String,
    answer: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
auctionSchema.index({ status: 1, endTime: 1 });
auctionSchema.index({ category: 1 });
auctionSchema.index({ tags: 1 });
auctionSchema.index({ itemName: 'text', description: 'text' });

// Virtual for time remaining
auctionSchema.virtual('timeRemaining').get(function() {
  if (this.status === 'ended' || this.status === 'won' || this.status === 'completed' || this.status === 'cancelled') {
    return 0;
  }
  const now = new Date();
  const remaining = this.endTime - now;
  return Math.max(0, remaining);
});

// Method to check if auction is live
auctionSchema.methods.isLive = function() {
  const now = new Date();
  return now >= this.startTime && now < this.endTime && this.status === 'live';
};

// Method to check if auction has ended
auctionSchema.methods.hasEnded = function() {
  const now = new Date();
  return now >= this.endTime || ['ended', 'won', 'completed', 'cancelled'].includes(this.status);
};

module.exports = mongoose.model('Auction', auctionSchema);
