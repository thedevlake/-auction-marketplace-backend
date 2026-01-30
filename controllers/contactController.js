const Contact = require('../models/Contact');
const { validationResult } = require('express-validator');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
exports.submitContact = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, message } = req.body;

    const contact = await Contact.create({
      name,
      email,
      message
    });

    res.status(201).json({
      message: 'Contact form submitted successfully',
      contact
    });
  } catch (error) {
    console.error('Submit contact error:', error);
    res.status(500).json({ message: 'Server error submitting contact form' });
  }
};
