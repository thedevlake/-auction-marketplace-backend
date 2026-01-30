const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const Notification = require('../models/Notification');
const { createNotification } = require('./notificationHelper');

// Check and update auction status
exports.updateAuctionStatus = async (auctionId) => {
  const auction = await Auction.findById(auctionId);
  if (!auction) return;

  const now = new Date();

  // Update status based on time
  if (auction.status === 'upcoming' && now >= auction.startTime && now < auction.endTime) {
    auction.status = 'live';
    await auction.save();
  }

  if (auction.status === 'live' && now >= auction.endTime) {
    await exports.completeAuction(auctionId);
  }
};

// Complete auction and determine winner
exports.completeAuction = async (auctionId) => {
  const auction = await Auction.findById(auctionId).populate('highestBidder');
  if (!auction) return;

  const now = new Date();
  if (now < auction.endTime && auction.status !== 'live') return;

  // Check if reserve price is met
  if (auction.reservePrice && auction.currentBid < auction.reservePrice) {
    auction.status = 'ended';
    auction.winner = null;
    await auction.save();
    return;
  }

  // Determine winner
  if (auction.highestBidder) {
    auction.status = 'won';
    auction.winner = auction.highestBidder._id;
    
    // Set payment deadline (e.g., 7 days from now)
    const paymentDeadline = new Date();
    paymentDeadline.setDate(paymentDeadline.getDate() + 7);
    auction.paymentDeadline = paymentDeadline;

    await auction.save();

    // Notify winner
    await createNotification({
      user: auction.highestBidder._id,
      type: 'auction_won',
      title: 'Congratulations! You won the auction',
      message: `You won the auction for "${auction.itemName}" with a bid of $${auction.currentBid}`,
      relatedAuction: auction._id
    });

    // Notify seller
    await createNotification({
      user: auction.seller,
      type: 'auction_ended',
      title: 'Auction completed',
      message: `Your auction "${auction.itemName}" has been won with a bid of $${auction.currentBid}`,
      relatedAuction: auction._id
    });
  } else {
    auction.status = 'ended';
    await auction.save();
  }
};

// Process auto-bid
exports.processAutoBid = async (auctionId, newBidAmount, newBidderId, io = null) => {
  const auction = await Auction.findById(auctionId);
  if (!auction) return;

  // Find all active auto-bids for this auction
  const autoBids = await Bid.find({
    auction: auctionId,
    isAutoBid: true,
    isWinning: false,
    maxBid: { $gte: newBidAmount + auction.bidIncrement }
  }).populate('bidder').sort({ maxBid: -1, createdAt: 1 });

  if (autoBids.length === 0) return;

  // Get the highest auto-bid
  const highestAutoBid = autoBids[0];
  const nextBidAmount = Math.min(
    newBidAmount + auction.bidIncrement,
    highestAutoBid.maxBid
  );

  // Create new bid from auto-bid
  const newBid = new Bid({
    auction: auctionId,
    bidder: highestAutoBid.bidder._id,
    bidAmount: nextBidAmount,
    isAutoBid: true,
    maxBid: highestAutoBid.maxBid,
    isWinning: true
  });

  await newBid.save();

  // Update auction
  auction.currentBid = nextBidAmount;
  auction.highestBidder = highestAutoBid.bidder._id;
  auction.numberOfBids += 1;
  await auction.save();

  // Mark previous winning bid as not winning
  await Bid.updateMany(
    { auction: auctionId, isWinning: true, _id: { $ne: newBid._id } },
    { isWinning: false }
  );

  // Notify previous highest bidder if different
  if (newBidderId && newBidderId.toString() !== highestAutoBid.bidder._id.toString()) {
    await createNotification({
      user: newBidderId,
      type: 'outbid',
      title: 'You\'ve been outbid',
      message: `You've been outbid on "${auction.itemName}". Current bid is now $${nextBidAmount}`,
      relatedAuction: auctionId
    });
  }

  // Emit real-time update
  if (io) {
    io.to(`auction-${auctionId}`).emit('new-bid', {
      auctionId,
      currentBid: nextBidAmount,
      highestBidder: highestAutoBid.bidder.name,
      numberOfBids: auction.numberOfBids
    });
  }

  // Recursively check for more auto-bids
  if (autoBids.length > 1) {
    await exports.processAutoBid(auctionId, nextBidAmount, highestAutoBid.bidder._id, io);
  }
};

// Check auctions ending soon and send notifications
exports.checkAuctionsEndingSoon = async () => {
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

  const auctions = await Auction.find({
    status: 'live',
    endTime: { $gte: now, $lte: oneHourFromNow }
  }).populate('highestBidder');

  for (const auction of auctions) {
    // Notify highest bidder
    if (auction.highestBidder) {
      await createNotification({
        user: auction.highestBidder._id,
        type: 'auction_ending_soon',
        title: 'Auction ending soon',
        message: `The auction for "${auction.itemName}" is ending in less than an hour!`,
        relatedAuction: auction._id
      });
    }

    // Notify watchlist users
    const Watchlist = require('../models/Watchlist');
    const watchlistUsers = await Watchlist.find({ auction: auction._id }).distinct('user');
    
    for (const userId of watchlistUsers) {
      if (auction.highestBidder && userId.toString() !== auction.highestBidder._id.toString()) {
        await createNotification({
          user: userId,
          type: 'auction_ending_soon',
          title: 'Auction ending soon',
          message: `An auction you're watching "${auction.itemName}" is ending in less than an hour!`,
          relatedAuction: auction._id
        });
      }
    }
  }
};
