const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createReview,
  getSellerReviews,
  getMyReviews
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Validation rules
const reviewValidation = [
  body('sellerId').notEmpty().withMessage('Seller ID is required'),
  body('auctionId').notEmpty().withMessage('Auction ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim()
];

router.post('/', protect, reviewValidation, createReview);
router.get('/seller/:sellerId', getSellerReviews);
router.get('/my-reviews', protect, getMyReviews);

module.exports = router;
