const jwtService = require('./jwtService');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = jwtService.extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const { valid, decoded, error } = jwtService.verifyToken(token);
    
    if (!valid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
        error: error
      });
    }

    // Find user by ID
    const user = await User.findById(decoded.userId).select('-otp -otpExpiry');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Account not verified. Please verify your email first.'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

module.exports = authMiddleware; 