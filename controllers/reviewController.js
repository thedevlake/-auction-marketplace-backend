const Review = require('../models/Review');
const User = require('../models/User');
const Auction = require('../models/Auction');
const { validationResult } = require('express-validator');

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sellerId, auctionId, rating, comment } = req.body;

    // Check if auction exists and user won it
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    if (auction.winner?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only review auctions you won' });
    }

    if (auction.seller.toString() !== sellerId) {
      return res.status(400).json({ message: 'Seller ID does not match auction seller' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      reviewer: req.user.id,
      auction: auctionId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this auction' });
    }

    // Create review
    const review = await Review.create({
      reviewer: req.user.id,
      seller: sellerId,
      auction: auctionId,
      rating,
      comment,
      verifiedPurchase: true
    });

    // Update seller rating
    await updateSellerRating(sellerId);

    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error creating review' });
  }
};

// @desc    Get reviews for a seller
// @route   GET /api/reviews/seller/:sellerId
// @access  Public
exports.getSellerReviews = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const reviews = await Review.find({ seller: sellerId })
      .populate('reviewer', 'name')
      .populate('auction', 'itemName')
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    console.error('Get seller reviews error:', error);
    res.status(500).json({ message: 'Server error fetching reviews' });
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewer: req.user.id })
      .populate('seller', 'name email')
      .populate('auction', 'itemName')
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({ message: 'Server error fetching reviews' });
  }
};

// Helper function to update seller rating
async function updateSellerRating(sellerId) {
  const reviews = await Review.find({ seller: sellerId });
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

  await User.findByIdAndUpdate(sellerId, {
    rating: averageRating,
    totalReviews: reviews.length
  });
}
