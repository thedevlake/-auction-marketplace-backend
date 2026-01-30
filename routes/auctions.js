const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createAuction,
  getAuctions,
  getHomepageCollections,
  getAuction,
  updateAuction,
  deleteAuction,
  getMyAuctions
} = require('../controllers/auctionController');
const { protect, isSeller } = require('../middleware/auth');

// Validation rules
const auctionValidation = [
  body('itemName').trim().notEmpty().withMessage('Item name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn(['Basic', 'Daily', 'Tech', 'Services', 'Collectibles', 'Digital', 'Fashion'])
    .withMessage('Invalid category'),
  body('startingPrice').isFloat({ min: 0 }).withMessage('Starting price must be a positive number'),
  body('bidIncrement').isFloat({ min: 0.01 }).withMessage('Bid increment must be at least 0.01'),
  body('endTime').isISO8601().withMessage('End time must be a valid date')
];

router.get('/homepage', getHomepageCollections);
router.get('/', getAuctions);
router.get('/:id', getAuction);
router.post('/', protect, isSeller, auctionValidation, createAuction);
router.put('/:id', protect, isSeller, updateAuction);
router.delete('/:id', protect, isSeller, deleteAuction);
router.get('/seller/my-auctions', protect, isSeller, getMyAuctions);

module.exports = router;
