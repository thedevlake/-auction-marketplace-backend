const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Auction = require('../models/Auction');
const { validationResult } = require('express-validator');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Create payment intent
// @route   POST /api/payments/create-intent
// @access  Private
exports.createPaymentIntent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { auctionId, paymentMethod } = req.body;

    // Get auction
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Check if user is the winner
    if (auction.winner?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not the winner of this auction' });
    }

    // Check if payment deadline has passed
    if (auction.paymentDeadline && new Date() > auction.paymentDeadline) {
      return res.status(400).json({ message: 'Payment deadline has passed' });
    }

    // Check if already paid
    const existingPayment = await Payment.findOne({
      auction: auctionId,
      user: req.user.id,
      status: 'succeeded'
    });

    if (existingPayment) {
      return res.status(400).json({ message: 'Payment already completed' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(auction.currentBid * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        auctionId: auctionId.toString(),
        userId: req.user.id.toString(),
        itemName: auction.itemName
      },
      payment_method_types: paymentMethod === 'card' 
        ? ['card'] 
        : ['card', 'apple_pay', 'google_pay']
    });

    // Create payment record
    const payment = await Payment.create({
      user: req.user.id,
      auction: auctionId,
      amount: auction.currentBid,
      stripePaymentIntentId: paymentIntent.id,
      paymentMethod: paymentMethod || 'card',
      status: 'pending'
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: 'Server error creating payment intent' });
  }
};

// @desc    Confirm payment
// @route   POST /api/payments/confirm
// @access  Private
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentId } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update payment status
      payment.status = 'succeeded';
      payment.completedAt = new Date();
      await payment.save();

      // Update auction status
      const auction = await Auction.findById(payment.auction);
      if (auction) {
        auction.status = 'completed';
        await auction.save();

        // Notify seller
        await createNotification({
          user: auction.seller,
          type: 'payment_received',
          title: 'Payment received',
          message: `Payment of $${payment.amount} has been received for "${auction.itemName}"`,
          relatedAuction: auction._id
        });
      }

      res.json({
        message: 'Payment confirmed successfully',
        payment
      });
    } else {
      res.status(400).json({ 
        message: 'Payment not completed',
        status: paymentIntent.status 
      });
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Server error confirming payment' });
  }
};

// @desc    Stripe webhook handler
// @route   POST /api/payments/webhook
// @access  Public (Stripe)
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;

    // Update payment status
    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntent.id
    });

    if (payment) {
      payment.status = 'succeeded';
      payment.completedAt = new Date();
      await payment.save();

      // Update auction status
      const auction = await Auction.findById(payment.auction);
      if (auction) {
        auction.status = 'completed';
        await auction.save();
      }
    }
  }

  res.json({ received: true });
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .populate('auction', 'itemName images')
      .sort({ createdAt: -1 });

    res.json({ payments });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Server error fetching payment history' });
  }
};
