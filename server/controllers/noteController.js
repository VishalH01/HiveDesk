const Note = require('../models/Note');
const Category = require('../models/Category');
const { validateNote } = require('../middleware/validation');

// Get all notes for the authenticated user
const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id })
      .populate('category', 'name color')
      .sort({ isPinned: -1, updatedAt: -1 });

    res.json({
      success: true,
      message: 'Notes retrieved successfully',
      notes
    });
  } catch (error) {
    console.error('Error getting notes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve notes'
    });
  }
};

// Get a single note by ID
const getNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id })
      .populate('category', 'name color');

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    res.json({
      success: true,
      message: 'Note retrieved successfully',
      note
    });
  } catch (error) {
    console.error('Error getting note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve note'
    });
  }
};

// Create a new note
const createNote = async (req, res) => {
  try {
    // Validate request body
    const { error } = validateNote(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { title, content, category, tags, isPinned } = req.body;

    // Check if category exists and belongs to user
    const categoryExists = await Category.findOne({ _id: category, user: req.user.id });
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    const note = new Note({
      title,
      content,
      category,
      tags: tags || [],
      isPinned: isPinned || false,
      user: req.user.id
    });

    await note.save();

    // Populate category info
    await note.populate('category', 'name color');

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      note
    });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create note'
    });
  }
};

// Update a note
const updateNote = async (req, res) => {
  try {
    console.log('Update note request body:', req.body);
    console.log('Note ID:', req.params.id);
    console.log('User ID:', req.user.id);

    // Validate request body
    const { error } = validateNote(req.body);
    if (error) {
      console.log('Validation error:', error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { title, content, category, tags, isPinned } = req.body;
    console.log('Extracted data:', { title, content, category, tags, isPinned });

    // Check if note exists and belongs to user
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) {
      console.log('Note not found for user');
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    console.log('Found note:', note._id);

    // Check if category exists and belongs to user
    if (category) {
      const categoryExists = await Category.findOne({ _id: category, user: req.user.id });
      if (!categoryExists) {
        console.log('Invalid category:', category);
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }
    }

    // Update note
    note.title = title;
    note.content = content;
    note.category = category;
    note.tags = tags || [];
    note.isPinned = isPinned || false;

    console.log('Saving note with data:', {
      title: note.title,
      content: note.content,
      category: note.category,
      tags: note.tags,
      isPinned: note.isPinned
    });

    await note.save();

    // Populate category info
    await note.populate('category', 'name color');

    console.log('Note updated successfully');

    res.json({
      success: true,
      message: 'Note updated successfully',
      note
    });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update note'
    });
  }
};

// Delete a note
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete note'
    });
  }
};

// Search notes
const searchNotes = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const notes = await Note.find({
      user: req.user.id,
      $text: { $search: q }
    })
      .populate('category', 'name color')
      .sort({ score: { $meta: 'textScore' }, isPinned: -1, updatedAt: -1 });

    res.json({
      success: true,
      message: 'Search completed successfully',
      notes
    });
  } catch (error) {
    console.error('Error searching notes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search notes'
    });
  }
};

module.exports = {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  searchNotes
}; 