const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const Watchlist = require('../models/Watchlist');
const { validationResult } = require('express-validator');
const { updateAuctionStatus } = require('../utils/auctionHelpers');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Create new auction
// @route   POST /api/auctions
// @access  Private (Seller)
exports.createAuction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const auctionData = {
      ...req.body,
      seller: req.user.id
    };

    // Validate end time is in the future
    if (new Date(auctionData.endTime) <= new Date()) {
      return res.status(400).json({ message: 'End time must be in the future' });
    }

    // Set status based on start time
    if (new Date(auctionData.startTime || Date.now()) <= new Date()) {
      auctionData.status = 'live';
    }

    const auction = await Auction.create(auctionData);

    res.status(201).json({
      message: 'Auction created successfully',
      auction
    });
  } catch (error) {
    console.error('Create auction error:', error);
    res.status(500).json({ message: 'Server error creating auction' });
  }
};

// @desc    Get all auctions with filtering and sorting
// @route   GET /api/auctions
// @access  Public
exports.getAuctions = async (req, res) => {
  try {
    const {
      category,
      tags,
      status,
      minPrice,
      maxPrice,
      search,
      sortBy = 'relevance',
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = {};

    if (category) {
      query.category = category;
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }

    if (status) {
      query.status = status;
    }

    if (minPrice || maxPrice) {
      query.currentBid = {};
      if (minPrice) query.currentBid.$gte = parseFloat(minPrice);
      if (maxPrice) query.currentBid.$lte = parseFloat(maxPrice);
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Build sort
    let sort = {};
    switch (sortBy) {
      case 'price-low':
        sort = { currentBid: 1 };
        break;
      case 'price-high':
        sort = { currentBid: -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'ending-soon':
        sort = { endTime: 1 };
        break;
      case 'most-bids':
        sort = { numberOfBids: -1 };
        break;
      case 'a-z':
        sort = { itemName: 1 };
        break;
      case 'z-a':
        sort = { itemName: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const auctions = await Auction.find(query)
      .populate('seller', 'name email rating')
      .populate('highestBidder', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Update status for live auctions
    for (const auction of auctions) {
      await updateAuctionStatus(auction._id);
    }

    const total = await Auction.countDocuments(query);

    res.json({
      auctions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get auctions error:', error);
    res.status(500).json({ message: 'Server error fetching auctions' });
  }
};

// @desc    Get homepage collections
// @route   GET /api/auctions/homepage
// @access  Public
exports.getHomepageCollections = async (req, res) => {
  try {
    const now = new Date();

    // Featured Collection (high-value auctions)
    const featured = await Auction.find({
      status: { $in: ['live', 'upcoming'] },
      currentBid: { $gte: 100 }
    })
      .populate('seller', 'name')
      .populate('highestBidder', 'name')
      .sort({ currentBid: -1 })
      .limit(10);

    // Favorites Collection (most watchlisted)
    const mostWatchlisted = await Watchlist.aggregate([
      { $group: { _id: '$auction', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).catch(() => []);

    const favoriteAuctionIds = mostWatchlisted.map(w => w._id).filter(Boolean);
    const favorites = favoriteAuctionIds.length > 0 
      ? await Auction.find({
          _id: { $in: favoriteAuctionIds },
          status: { $in: ['live', 'upcoming'] }
        })
          .populate('seller', 'name')
          .populate('highestBidder', 'name')
          .limit(10)
      : [];

    // Best Sellers Collection (highest activity)
    const bestSellers = await Auction.find({
      status: { $in: ['live', 'upcoming'] },
      numberOfBids: { $gte: 5 }
    })
      .populate('seller', 'name')
      .populate('highestBidder', 'name')
      .sort({ numberOfBids: -1 })
      .limit(10);

    // Sale Collection (reduced starting price or discount)
    const sale = await Auction.find({
      status: { $in: ['live', 'upcoming'] },
      $or: [
        { tags: 'No Reserve' },
        { reservePrice: { $exists: false } }
      ]
    })
      .populate('seller', 'name')
      .populate('highestBidder', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // New In Collection
    const newIn = await Auction.find({
      status: { $in: ['live', 'upcoming'] },
      tags: 'New'
    })
      .populate('seller', 'name')
      .populate('highestBidder', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      featured,
      favorites,
      bestSellers,
      sale,
      newIn
    });
  } catch (error) {
    console.error('Get homepage collections error:', error);
    res.status(500).json({ 
      message: 'Server error fetching homepage collections',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single auction
// @route   GET /api/auctions/:id
// @access  Public
exports.getAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('seller', 'name email rating totalReviews')
      .populate('highestBidder', 'name')
      .populate('winner', 'name email');

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Update status
    await updateAuctionStatus(auction._id);

    // Get bid history
    const bidHistory = await Bid.find({ auction: auction._id })
      .populate('bidder', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    // Get related auctions (same category)
    const relatedAuctions = await Auction.find({
      category: auction.category,
      _id: { $ne: auction._id },
      status: { $in: ['live', 'upcoming'] }
    })
      .populate('seller', 'name')
      .populate('highestBidder', 'name')
      .limit(5);

    res.json({
      auction,
      bidHistory,
      relatedAuctions
    });
  } catch (error) {
    console.error('Get auction error:', error);
    res.status(500).json({ message: 'Server error fetching auction' });
  }
};

// @desc    Update auction
// @route   PUT /api/auctions/:id
// @access  Private (Seller - own auctions only)
exports.updateAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Check ownership
    if (auction.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this auction' });
    }

    // Can only update if no bids have been placed
    if (auction.numberOfBids > 0) {
      return res.status(400).json({ message: 'Cannot update auction with existing bids' });
    }

    const updatedAuction = await Auction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Auction updated successfully',
      auction: updatedAuction
    });
  } catch (error) {
    console.error('Update auction error:', error);
    res.status(500).json({ message: 'Server error updating auction' });
  }
};

// @desc    Delete auction
// @route   DELETE /api/auctions/:id
// @access  Private (Seller - own auctions only)
exports.deleteAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Check ownership
    if (auction.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this auction' });
    }

    // Can only delete if no bids
    if (auction.numberOfBids > 0) {
      return res.status(400).json({ message: 'Cannot delete auction with existing bids' });
    }

    await Auction.findByIdAndDelete(req.params.id);

    res.json({ message: 'Auction deleted successfully' });
  } catch (error) {
    console.error('Delete auction error:', error);
    res.status(500).json({ message: 'Server error deleting auction' });
  }
};

// @desc    Get seller's auctions
// @route   GET /api/auctions/seller/my-auctions
// @access  Private (Seller)
exports.getMyAuctions = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { seller: req.user.id };
    
    if (status) {
      query.status = status;
    }

    const auctions = await Auction.find(query)
      .populate('highestBidder', 'name')
      .populate('winner', 'name')
      .sort({ createdAt: -1 });

    res.json({ auctions });
  } catch (error) {
    console.error('Get my auctions error:', error);
    res.status(500).json({ message: 'Server error fetching auctions' });
  }
};
