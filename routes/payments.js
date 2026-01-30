const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createPaymentIntent,
  confirmPayment,
  stripeWebhook,
  getPaymentHistory
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Webhook route (raw body is handled in server.js)
router.post('/webhook', stripeWebhook);

// Regular routes with JSON body parser
router.post('/create-intent', protect, [
  body('auctionId').notEmpty().withMessage('Auction ID is required'),
  body('paymentMethod').optional().isIn(['card', 'apple_pay', 'google_pay'])
], createPaymentIntent);

router.post('/confirm', protect, [
  body('paymentId').notEmpty().withMessage('Payment ID is required')
], confirmPayment);

router.get('/history', protect, getPaymentHistory);

module.exports = router;
