const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// GET /api/categories - Get all categories for the authenticated user
router.get('/', categoryController.getCategories);

// GET /api/categories/stats - Get category statistics
router.get('/stats', categoryController.getCategoryStats);

// GET /api/categories/:id - Get a single category by ID
router.get('/:id', categoryController.getCategory);

// POST /api/categories - Create a new category
router.post('/', categoryController.createCategory);

// PUT /api/categories/:id - Update a category
router.put('/:id', categoryController.updateCategory);

// DELETE /api/categories/:id - Delete a category
router.delete('/:id', categoryController.deleteCategory);

module.exports = router; 