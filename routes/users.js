const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getWonAuctions,
  getPurchaseHistory,
  getEarnings
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/won-auctions', protect, getWonAuctions);
router.get('/purchase-history', protect, getPurchaseHistory);
router.get('/earnings', protect, getEarnings);

module.exports = router;
