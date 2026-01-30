const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
  checkWatchlist
} = require('../controllers/watchlistController');
const { protect } = require('../middleware/auth');

router.post('/', protect, [
  body('auctionId').notEmpty().withMessage('Auction ID is required')
], addToWatchlist);
router.delete('/:auctionId', protect, removeFromWatchlist);
router.get('/', protect, getWatchlist);
router.get('/check/:auctionId', protect, checkWatchlist);

module.exports = router;
