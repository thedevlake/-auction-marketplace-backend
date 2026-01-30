const Notification = require('../models/Notification');
const nodemailer = require('nodemailer');

// Create notification
exports.createNotification = async ({ user, type, title, message, relatedAuction }) => {
  try {
    const notification = new Notification({
      user,
      type,
      title,
      message,
      relatedAuction
    });

    await notification.save();

    // Send email notification
    await exports.sendEmailNotification(user, { type, title, message });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Send email notification
exports.sendEmailNotification = async (userId, notificationData) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(userId);

    if (!user || !user.email) return;

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: notificationData.title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${notificationData.title}</h2>
          <p>${notificationData.message}</p>
          <p>Thank you for using our auction marketplace!</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    // Update notification email sent status
    await Notification.updateOne(
      { user: userId, type: notificationData.type, emailSent: false },
      { emailSent: true }
    );
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
};
