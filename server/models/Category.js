const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Category name cannot be more than 50 characters']
  },
  color: {
    type: String,
    required: [true, 'Category color is required'],
    default: '#3B82F6',
    validate: {
      validator: function(v) {
        return /^#[0-9A-F]{6}$/i.test(v);
      },
      message: 'Color must be a valid hex color code'
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  }
}, {
  timestamps: true
});

// Ensure unique category names per user
categorySchema.index({ user: 1, name: 1 }, { unique: true });

// Virtual for note count
categorySchema.virtual('noteCount', {
  ref: 'Note',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Ensure virtual fields are serialized
categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Category', categorySchema); 