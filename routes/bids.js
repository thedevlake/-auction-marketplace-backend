const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  placeBid,
  getActiveBids,
  getBidHistory,
  cancelAutoBid
} = require('../controllers/bidController');
const { protect } = require('../middleware/auth');

// Validation rules
const bidValidation = [
  body('auctionId').notEmpty().withMessage('Auction ID is required'),
  body('bidAmount').isFloat({ min: 0 }).withMessage('Bid amount must be a positive number'),
  body('isAutoBid').optional().isBoolean(),
  body('maxBid').optional().isFloat({ min: 0 })
];

router.post('/', protect, bidValidation, placeBid);
router.get('/active', protect, getActiveBids);
router.get('/history', protect, getBidHistory);
router.delete('/auto-bid/:auctionId', protect, cancelAutoBid);

module.exports = router;
