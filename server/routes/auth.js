const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const {
  signUpValidation,
  signInValidation,
  sendOTPValidation,
  verifyOTPValidation,
  handleValidationErrors
} = require('../utils/validationMiddleware');

// Send OTP
router.post('/send-otp', sendOTPValidation, handleValidationErrors, authController.sendOTP);

// Verify OTP
router.post('/verify-otp', verifyOTPValidation, handleValidationErrors, authController.verifyOTP);

// Sign Up
router.post('/signup', signUpValidation, handleValidationErrors, authController.signUp);

// Sign In
router.post('/signin', signInValidation, handleValidationErrors, authController.signIn);

// Get current user (protected route)
router.get('/me', authMiddleware, authController.getCurrentUser);

// Sign Out
router.post('/signout', authMiddleware, authController.signOut);

module.exports = router; 