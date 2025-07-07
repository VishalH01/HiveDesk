const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Note title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Note content is required'],
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  }
}, {
  timestamps: true
});

// Index for better search performance
noteSchema.index({ title: 'text', content: 'text', tags: 'text' });
noteSchema.index({ user: 1, isPinned: -1, updatedAt: -1 });
noteSchema.index({ user: 1, category: 1 });

// Virtual for formatted date
noteSchema.virtual('formattedDate').get(function() {
  return this.updatedAt.toLocaleDateString();
});

// Ensure virtual fields are serialized
noteSchema.set('toJSON', { virtuals: true });
noteSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Note', noteSchema); 