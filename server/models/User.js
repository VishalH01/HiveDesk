const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
    match: [/^[a-zA-Z\s]+$/, 'Name can only contain alphabets and spaces']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [false, 'Password is optional for OTP-only users'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  birthday: {
    type: Date,
    required: [true, 'Birthday is required'],
    validate: {
      validator: function(value) {
        try {
          const today = new Date();
          const birthDate = new Date(value);
          let calculatedAge = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            calculatedAge--;
          }
          
          console.log('Birthday validation debug:', {
            birthDate: birthDate,
            today: today,
            calculatedAge: calculatedAge,
            isValid: calculatedAge >= 13 && calculatedAge <= 120
          });
          
          return calculatedAge >= 13 && calculatedAge <= 120;
        } catch (error) {
          console.log('Birthday validation error:', error);
          return false;
        }
      },
      message: 'Age must be between 13 and 120 years'
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String,
    default: null
  },
  otpExpiry: {
    type: Date,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ otpExpiry: 1 });

// Method to check if OTP is expired
userSchema.methods.isOTPExpired = function() {
  if (!this.otpExpiry) return true;
  return new Date() > this.otpExpiry;
};

// Method to clear OTP
userSchema.methods.clearOTP = function() {
  this.otp = null;
  this.otpExpiry = null;
  return this.save();
};

// Method to generate and save OTP
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return this.save();
};

// Method to hash password
userSchema.methods.hashPassword = async function(password) {
  const bcrypt = require('bcryptjs');
  this.password = await bcrypt.hash(password, 12);
  return this.save();
};

// Method to compare password
userSchema.methods.comparePassword = async function(password) {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(password, this.password);
};

// Pre-save middleware to update updatedAt
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('User', userSchema); 