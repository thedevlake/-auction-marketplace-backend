const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  stripePaymentIntentId: {
    type: String
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'apple_pay', 'google_pay', 'card']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'succeeded', 'failed', 'refunded'],
    default: 'pending'
  },
  metadata: {
    type: Map,
    of: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

// Indexes
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ auction: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
