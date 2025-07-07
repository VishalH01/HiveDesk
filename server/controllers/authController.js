const User = require('../models/User');
const Category = require('../models/Category');
const emailService = require('../utils/emailService');
const jwtService = require('../utils/jwtService');

// Create default categories for new users
const createDefaultCategories = async (userId) => {
  const defaultCategories = [
    { name: 'Personal', color: '#3B82F6' },
    { name: 'Work', color: '#10B981' },
    { name: 'Ideas', color: '#F59E0B' },
    { name: 'Todo', color: '#EF4444' },
    { name: 'Important', color: '#8B5CF6' }
  ];

  try {
    for (const category of defaultCategories) {
      await Category.create({
        ...category,
        user: userId
      });
    }
    console.log(`Created default categories for user ${userId}`);
  } catch (error) {
    console.error('Error creating default categories:', error);
  }
};

// Send OTP
const sendOTP = async (req, res) => {
  try {
    const { email, purpose, name } = req.body;

    let user = await User.findOne({ email });

    if (purpose === 'signup') {
      if (user) {
        return res.status(400).json({
          success: false,
          message: 'User already exists. Please sign in.'
        });
      }
      // Create a temp user for OTP with a valid birthday (25 years ago)
      const tempBirthday = new Date();
      tempBirthday.setFullYear(tempBirthday.getFullYear() - 25);
      user = new User({ email, name: name || 'User', birthday: tempBirthday });
    } else if (purpose === 'signin') {
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found. Please sign up first.'
        });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Invalid purpose.' });
    }

    await user.generateOTP();
    await user.save();

    // Send OTP via email
    const emailResult = await emailService.sendOTP(email, user.otp, user.name);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email.'
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Debug: Log OTP details
    console.log('OTP Verification Debug:', {
      email,
      userOTP: user.otp,
      providedOTP: otp,
      otpExpiry: user.otpExpiry,
      currentTime: new Date(),
      isExpired: user.isOTPExpired()
    });

    // Check if OTP is expired
    if (user.isOTPExpired()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      });
    }

    // Don't clear OTP here - let the signup process handle it
    // await user.clearOTP();

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully.'
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

// Sign Up
const signUp = async (req, res) => {
  try {
    const { name, email, birthday, otp, password } = req.body;
    
    // Debug: Log the received data
    console.log('SignUp request data:', { name, email, birthday, otp });

    // Check if user already exists (excluding temp users created for OTP)
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists.'
      });
    }

    // If OTP is provided, verify it first
    if (otp) {
      // Find the user that was created during OTP sending
      const tempUser = await User.findOne({ email });
      
      if (!tempUser) {
        return res.status(400).json({
          success: false,
          message: 'No OTP found for this email. Please send OTP first.'
        });
      }

      if (tempUser.isOTPExpired()) {
        return res.status(400).json({
          success: false,
          message: 'OTP has expired. Please request a new one.'
        });
      }

      if (tempUser.otp !== otp) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP. Please try again.'
        });
      }

      // Clear OTP after successful verification
      await tempUser.clearOTP();
    }

    // Create new user or update existing temp user
    let user;
    if (existingUser && !existingUser.isVerified) {
      // Update existing temp user
      user = existingUser;
      user.name = name;
      user.birthday = new Date(birthday);
      user.isVerified = otp ? true : false;
    } else {
      // Create new user
      user = new User({
        name,
        email,
        birthday: new Date(birthday),
        isVerified: otp ? true : false // Mark as verified if OTP was provided
      });
    }

    // Hash password (required for signup)
    await user.hashPassword(password);

    // Generate and send OTP if not provided
    if (!otp) {
      await user.generateOTP();
      
      const emailResult = await emailService.sendOTP(email, user.otp, user.name);
      
      if (!emailResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to send OTP. Please try again.'
        });
      }
    }

    await user.save();

    // Create default categories for new users
    if (otp) {
      await createDefaultCategories(user._id);
    }

    res.status(201).json({
      success: true,
      message: otp ? 'Account created successfully!' : 'Account created. Please verify your email with the OTP sent.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Sign up error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

// Sign In
const signIn = async (req, res) => {
  try {
    const { email, otp, password, keepLoggedIn } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please sign up first.'
      });
    }

    // Check if user provided password or OTP
    if (!password && !otp) {
      // Generate and send OTP
      await user.generateOTP();
      
      const emailResult = await emailService.sendOTP(email, user.otp, user.name);
      
      if (!emailResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to send OTP. Please try again.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'OTP sent to your email. Please verify to sign in.'
      });
    }

    // If password is provided, verify it
    if (password) {
      if (!user.password) {
        return res.status(400).json({
          success: false,
          message: 'This account does not have a password. Please use OTP login.'
        });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid password. Please try again.'
        });
      }
    }
    // If OTP is provided, verify it
    else if (otp) {
      if (user.isOTPExpired()) {
        return res.status(400).json({
          success: false,
          message: 'OTP has expired. Please request a new one.'
        });
      }

      if (user.otp !== otp) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP. Please try again.'
        });
      }

      // Clear OTP after successful verification
      await user.clearOTP();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwtService.generateToken(user._id, keepLoggedIn);

    res.status(200).json({
      success: true,
      message: 'Sign in successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        birthday: user.birthday,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-otp -otpExpiry');
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        birthday: user.birthday,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

// Sign out (client-side token removal)
const signOut = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Sign out successful.'
    });
  } catch (error) {
    console.error('Sign out error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  signUp,
  signIn,
  getCurrentUser,
  signOut
}; 