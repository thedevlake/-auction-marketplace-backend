const { checkAuctionsEndingSoon, updateAuctionStatus, completeAuction } = require('./auctionHelpers');
const Auction = require('../models/Auction');
const { createNotification } = require('./notificationHelper');

// Check and update auction statuses every minute
exports.startAuctionStatusChecker = () => {
  setInterval(async () => {
    try {
      // Get all live and upcoming auctions
      const auctions = await Auction.find({
        status: { $in: ['live', 'upcoming'] }
      });

      for (const auction of auctions) {
        await updateAuctionStatus(auction._id);
      }
    } catch (error) {
      console.error('Error in auction status checker:', error);
    }
  }, 60000); // Run every minute
};

// Check auctions ending soon every 5 minutes
exports.startEndingSoonChecker = () => {
  setInterval(async () => {
    try {
      await checkAuctionsEndingSoon();
    } catch (error) {
      console.error('Error in ending soon checker:', error);
    }
  }, 5 * 60 * 1000); // Run every 5 minutes
};

// Check payment deadlines and send reminders
exports.startPaymentReminderChecker = () => {
  setInterval(async () => {
    try {
      const now = new Date();
      const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

      // Find auctions with payment deadlines approaching
      const auctions = await Auction.find({
        status: 'won',
        paymentDeadline: {
          $gte: now,
          $lte: twoDaysFromNow
        }
      }).populate('winner');

      for (const auction of auctions) {
        if (auction.winner) {
          const daysRemaining = Math.ceil(
            (auction.paymentDeadline - now) / (24 * 60 * 60 * 1000)
          );

          // Send reminder if 1 day or less remaining
          if (daysRemaining <= 1) {
            await createNotification({
              user: auction.winner._id,
              type: 'payment_reminder',
              title: 'Payment deadline approaching',
              message: `Payment for "${auction.itemName}" is due in ${daysRemaining} day(s). Please complete payment soon.`,
              relatedAuction: auction._id
            });
          }
        }
      }
    } catch (error) {
      console.error('Error in payment reminder checker:', error);
    }
  }, 60 * 60 * 1000); // Run every hour
};
