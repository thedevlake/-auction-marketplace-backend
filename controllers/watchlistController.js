const Watchlist = require('../models/Watchlist');
const Auction = require('../models/Auction');

// @desc    Add auction to watchlist
// @route   POST /api/watchlist
// @access  Private
exports.addToWatchlist = async (req, res) => {
  try {
    const { auctionId } = req.body;

    // Check if auction exists
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Check if already in watchlist
    const existing = await Watchlist.findOne({
      user: req.user.id,
      auction: auctionId
    });

    if (existing) {
      return res.status(400).json({ message: 'Auction already in watchlist' });
    }

    const watchlistItem = await Watchlist.create({
      user: req.user.id,
      auction: auctionId
    });

    res.status(201).json({
      message: 'Added to watchlist',
      watchlistItem
    });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({ message: 'Server error adding to watchlist' });
  }
};

// @desc    Remove auction from watchlist
// @route   DELETE /api/watchlist/:auctionId
// @access  Private
exports.removeFromWatchlist = async (req, res) => {
  try {
    const { auctionId } = req.params;

    const watchlistItem = await Watchlist.findOneAndDelete({
      user: req.user.id,
      auction: auctionId
    });

    if (!watchlistItem) {
      return res.status(404).json({ message: 'Item not found in watchlist' });
    }

    res.json({ message: 'Removed from watchlist' });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({ message: 'Server error removing from watchlist' });
  }
};

// @desc    Get user's watchlist
// @route   GET /api/watchlist
// @access  Private
exports.getWatchlist = async (req, res) => {
  try {
    const watchlistItems = await Watchlist.find({ user: req.user.id })
      .populate({
        path: 'auction',
        populate: [
          { path: 'seller', select: 'name' },
          { path: 'highestBidder', select: 'name' }
        ]
      })
      .sort({ createdAt: -1 });

    res.json({ watchlist: watchlistItems });
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({ message: 'Server error fetching watchlist' });
  }
};

// @desc    Check if auction is in watchlist
// @route   GET /api/watchlist/check/:auctionId
// @access  Private
exports.checkWatchlist = async (req, res) => {
  try {
    const { auctionId } = req.params;

    const watchlistItem = await Watchlist.findOne({
      user: req.user.id,
      auction: auctionId
    });

    res.json({ inWatchlist: !!watchlistItem });
  } catch (error) {
    console.error('Check watchlist error:', error);
    res.status(500).json({ message: 'Server error checking watchlist' });
  }
};
