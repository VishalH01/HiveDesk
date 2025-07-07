const Joi = require('joi');

// Note validation schema
const validateNote = (data) => {
  const schema = Joi.object({
    title: Joi.string()
      .required()
      .min(1)
      .max(200)
      .messages({
        'string.empty': 'Note title is required',
        'string.min': 'Note title must be at least 1 character long',
        'string.max': 'Note title cannot exceed 200 characters'
      }),
    content: Joi.string()
      .required()
      .min(1)
      .messages({
        'string.empty': 'Note content is required',
        'string.min': 'Note content must be at least 1 character long'
      }),
    category: Joi.string()
      .required()
      .messages({
        'string.empty': 'Category is required'
      }),
    tags: Joi.array()
      .items(Joi.string().trim().min(1))
      .optional()
      .default([]),
    isPinned: Joi.boolean()
      .optional()
      .default(false)
  });

  return schema.validate(data);
};

// Category validation schema
const validateCategory = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .required()
      .min(1)
      .max(50)
      .trim()
      .messages({
        'string.empty': 'Category name is required',
        'string.min': 'Category name must be at least 1 character long',
        'string.max': 'Category name cannot exceed 50 characters'
      }),
    color: Joi.string()
      .required()
      .pattern(/^#[0-9A-F]{6}$/i)
      .messages({
        'string.empty': 'Category color is required',
        'string.pattern.base': 'Color must be a valid hex color code (e.g., #3B82F6)'
      })
  });

  return schema.validate(data);
};

// User validation schema (for reference)
const validateUser = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .required()
      .min(2)
      .max(50)
      .trim()
      .messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 50 characters'
      }),
    email: Joi.string()
      .required()
      .email()
      .lowercase()
      .trim()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email address'
      }),
    birthday: Joi.date()
      .required()
      .max('now')
      .messages({
        'date.base': 'Please provide a valid birthday',
        'date.max': 'Birthday cannot be in the future'
      }),
    password: Joi.string()
      .optional()
      .min(6)
      .messages({
        'string.min': 'Password must be at least 6 characters long'
      }),
    otp: Joi.string()
      .optional()
      .length(6)
      .pattern(/^\d{6}$/)
      .messages({
        'string.length': 'OTP must be exactly 6 digits',
        'string.pattern.base': 'OTP must contain only digits'
      })
  });

  return schema.validate(data);
};

// OTP validation schema
const validateOTP = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .required()
      .email()
      .lowercase()
      .trim()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email address'
      }),
    otp: Joi.string()
      .required()
      .length(6)
      .pattern(/^\d{6}$/)
      .messages({
        'string.empty': 'OTP is required',
        'string.length': 'OTP must be exactly 6 digits',
        'string.pattern.base': 'OTP must contain only digits'
      })
  });

  return schema.validate(data);
};

// Send OTP validation schema
const validateSendOTP = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .required()
      .email()
      .lowercase()
      .trim()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email address'
      }),
    purpose: Joi.string()
      .required()
      .valid('signup', 'signin')
      .messages({
        'string.empty': 'Purpose is required',
        'any.only': 'Purpose must be either "signup" or "signin"'
      }),
    name: Joi.string()
      .optional()
      .min(2)
      .max(50)
      .trim()
      .messages({
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 50 characters'
      })
  });

  return schema.validate(data);
};

// Sign in validation schema
const validateSignIn = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .required()
      .email()
      .lowercase()
      .trim()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email address'
      }),
    password: Joi.string()
      .optional()
      .min(6)
      .messages({
        'string.min': 'Password must be at least 6 characters long'
      }),
    otp: Joi.string()
      .optional()
      .length(6)
      .pattern(/^\d{6}$/)
      .messages({
        'string.length': 'OTP must be exactly 6 digits',
        'string.pattern.base': 'OTP must contain only digits'
      }),
    keepLoggedIn: Joi.boolean()
      .optional()
      .default(false)
  }).or('password', 'otp');

  return schema.validate(data);
};

module.exports = {
  validateNote,
  validateCategory,
  validateUser,
  validateOTP,
  validateSendOTP,
  validateSignIn
}; 