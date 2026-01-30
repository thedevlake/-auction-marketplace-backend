const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { submitContact } = require('../controllers/contactController');

// Validation rules
const contactValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('message').trim().notEmpty().withMessage('Message is required')
];

router.post('/', contactValidation, submitContact);

module.exports = router;
