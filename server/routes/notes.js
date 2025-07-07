const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const authMiddleware = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// GET /api/notes - Get all notes for the authenticated user
router.get('/', noteController.getNotes);

// GET /api/notes/search - Search notes
router.get('/search', noteController.searchNotes);

// GET /api/notes/:id - Get a single note by ID
router.get('/:id', noteController.getNote);

// POST /api/notes - Create a new note
router.post('/', noteController.createNote);

// PUT /api/notes/:id - Update a note
router.put('/:id', noteController.updateNote);

// DELETE /api/notes/:id - Delete a note
router.delete('/:id', noteController.deleteNote);

module.exports = router; 