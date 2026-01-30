const User = require('../models/User');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const Payment = require('../models/Payment');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, role } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (role && ['buyer', 'seller', 'hybrid'].includes(role)) {
      updateData.role = role;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// @desc    Get won auctions
// @route   GET /api/users/won-auctions
// @access  Private
exports.getWonAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find({
      winner: req.user.id,
      status: { $in: ['won', 'unpaid', 'completed'] }
    })
      .populate('seller', 'name email')
      .sort({ endTime: -1 });

    res.json({ auctions });
  } catch (error) {
    console.error('Get won auctions error:', error);
    res.status(500).json({ message: 'Server error fetching won auctions' });
  }
};

// @desc    Get purchase history
// @route   GET /api/users/purchase-history
// @access  Private
exports.getPurchaseHistory = async (req, res) => {
  try {
    const payments = await Payment.find({
      user: req.user.id,
      status: 'succeeded'
    })
      .populate({
        path: 'auction',
        populate: { path: 'seller', select: 'name email' }
      })
      .sort({ completedAt: -1 });

    res.json({ purchases: payments });
  } catch (error) {
    console.error('Get purchase history error:', error);
    res.status(500).json({ message: 'Server error fetching purchase history' });
  }
};

// @desc    Get seller earnings dashboard
// @route   GET /api/users/earnings
// @access  Private (Seller)
exports.getEarnings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'seller' && user.role !== 'hybrid') {
      return res.status(403).json({ message: 'Seller privileges required' });
    }

    // Get completed auctions
    const completedAuctions = await Auction.find({
      seller: req.user.id,
      status: 'completed'
    });

    // Get payments for sold items
    const payments = await Payment.find({
      auction: { $in: completedAuctions.map(a => a._id) },
      status: 'succeeded'
    });

    const totalEarnings = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalSales = completedAuctions.length;
    const pendingPayments = await Auction.countDocuments({
      seller: req.user.id,
      status: 'won'
    });

    res.json({
      totalEarnings,
      totalSales,
      pendingPayments,
      recentSales: payments.slice(0, 10)
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({ message: 'Server error fetching earnings' });
  }
};
