const Bid = require('../models/Bid');
const Auction = require('../models/Auction');
const { validationResult } = require('express-validator');
const { processAutoBid, updateAuctionStatus } = require('../utils/auctionHelpers');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Place manual bid
// @route   POST /api/bids
// @access  Private
exports.placeBid = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { auctionId, bidAmount, isAutoBid, maxBid } = req.body;
    const bidderId = req.user.id;

    // Get auction
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Update auction status
    await updateAuctionStatus(auctionId);

    // Check if auction is live
    if (auction.status !== 'live') {
      return res.status(400).json({ message: 'Auction is not live' });
    }

    // Check if seller is trying to bid on own auction
    if (auction.seller.toString() === bidderId) {
      return res.status(400).json({ message: 'Cannot bid on your own auction' });
    }

    // Validate bid amount
    const minimumBid = auction.currentBid + auction.bidIncrement;
    if (bidAmount < minimumBid) {
      return res.status(400).json({ 
        message: `Bid must be at least $${minimumBid.toFixed(2)}` 
      });
    }

    // For auto-bid, validate max bid
    if (isAutoBid) {
      if (!maxBid || maxBid < bidAmount) {
        return res.status(400).json({ 
          message: 'Max bid must be greater than or equal to initial bid amount' 
        });
      }
    }

    // Check if user already has an active auto-bid
    if (isAutoBid) {
      const existingAutoBid = await Bid.findOne({
        auction: auctionId,
        bidder: bidderId,
        isAutoBid: true,
        isWinning: true
      });

      if (existingAutoBid) {
        // Update existing auto-bid
        existingAutoBid.maxBid = maxBid;
        existingAutoBid.bidAmount = Math.max(existingAutoBid.bidAmount, bidAmount);
        await existingAutoBid.save();
        return res.json({
          message: 'Auto-bid updated successfully',
          bid: existingAutoBid
        });
      }
    }

    // Create bid
    const bid = new Bid({
      auction: auctionId,
      bidder: bidderId,
      bidAmount,
      isAutoBid: isAutoBid || false,
      maxBid: isAutoBid ? maxBid : undefined,
      isWinning: true
    });

    await bid.save();

    // Mark previous winning bid as not winning
    await Bid.updateMany(
      { 
        auction: auctionId, 
        isWinning: true, 
        _id: { $ne: bid._id } 
      },
      { isWinning: false }
    );

    // Update auction
    auction.currentBid = bidAmount;
    auction.highestBidder = bidderId;
    auction.numberOfBids += 1;
    await auction.save();

    // Notify previous highest bidder if different
    if (auction.highestBidder && auction.highestBidder.toString() !== bidderId) {
      const previousBidder = await Bid.findOne({
        auction: auctionId,
        bidder: auction.highestBidder,
        isWinning: false
      }).sort({ createdAt: -1 });

      if (previousBidder) {
        await createNotification({
          user: auction.highestBidder,
          type: 'outbid',
          title: 'You\'ve been outbid',
          message: `You've been outbid on "${auction.itemName}". Current bid is now $${bidAmount}`,
          relatedAuction: auctionId
        });
      }
    }

    // Notify seller
    await createNotification({
      user: auction.seller,
      type: 'new_bid_on_item',
      title: 'New bid on your item',
      message: `Someone placed a bid of $${bidAmount} on "${auction.itemName}"`,
      relatedAuction: auctionId
    });

    // Process auto-bids if this is a manual bid
    const io = req.app.get('io');
    if (!isAutoBid) {
      await processAutoBid(auctionId, bidAmount, bidderId, io);
    }

    // Emit real-time update
    io.to(`auction-${auctionId}`).emit('new-bid', {
      auctionId,
      currentBid: auction.currentBid,
      highestBidder: req.user.name,
      numberOfBids: auction.numberOfBids
    });

    res.status(201).json({
      message: 'Bid placed successfully',
      bid
    });
  } catch (error) {
    console.error('Place bid error:', error);
    res.status(500).json({ message: 'Server error placing bid' });
  }
};

// @desc    Get user's active bids
// @route   GET /api/bids/active
// @access  Private
exports.getActiveBids = async (req, res) => {
  try {
    const bids = await Bid.find({
      bidder: req.user.id,
      isWinning: true
    })
      .populate({
        path: 'auction',
        match: { status: { $in: ['live', 'upcoming'] } },
        populate: [
          { path: 'seller', select: 'name' },
          { path: 'highestBidder', select: 'name' }
        ]
      })
      .sort({ createdAt: -1 });

    // Filter out bids with null auctions (auctions that don't match status)
    const activeBids = bids.filter(bid => bid.auction !== null);

    res.json({ bids: activeBids });
  } catch (error) {
    console.error('Get active bids error:', error);
    res.status(500).json({ message: 'Server error fetching active bids' });
  }
};

// @desc    Get user's bid history
// @route   GET /api/bids/history
// @access  Private
exports.getBidHistory = async (req, res) => {
  try {
    const bids = await Bid.find({ bidder: req.user.id })
      .populate({
        path: 'auction',
        populate: [
          { path: 'seller', select: 'name' },
          { path: 'winner', select: 'name' }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ bids });
  } catch (error) {
    console.error('Get bid history error:', error);
    res.status(500).json({ message: 'Server error fetching bid history' });
  }
};

// @desc    Cancel auto-bid
// @route   DELETE /api/bids/auto-bid/:auctionId
// @access  Private
exports.cancelAutoBid = async (req, res) => {
  try {
    const { auctionId } = req.params;

    const autoBid = await Bid.findOne({
      auction: auctionId,
      bidder: req.user.id,
      isAutoBid: true,
      isWinning: true
    });

    if (!autoBid) {
      return res.status(404).json({ message: 'No active auto-bid found' });
    }

    // Remove auto-bid
    autoBid.isWinning = false;
    await autoBid.save();

    res.json({ message: 'Auto-bid cancelled successfully' });
  } catch (error) {
    console.error('Cancel auto-bid error:', error);
    res.status(500).json({ message: 'Server error cancelling auto-bid' });
  }
};
