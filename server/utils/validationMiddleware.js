const { body, validationResult } = require('express-validator');

// Validation rules for sign up
const signUpValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain alphabets and spaces'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  
  body('birthday')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('otp')
    .optional()
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers')
];

// Validation rules for sign in
const signInValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('otp')
    .optional()
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),
  
  body('keepLoggedIn')
    .optional()
    .isBoolean()
    .withMessage('Keep logged in must be a boolean value')
];

// Validation rules for send OTP
const sendOTPValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
];

// Validation rules for verify OTP
const verifyOTPValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers')
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
};

module.exports = {
  signUpValidation,
  signInValidation,
  sendOTPValidation,
  verifyOTPValidation,
  handleValidationErrors
}; 