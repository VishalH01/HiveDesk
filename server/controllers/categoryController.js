const Category = require('../models/Category');
const Note = require('../models/Note');
const { validateCategory } = require('../middleware/validation');

// Get all categories for the authenticated user
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user.id })
      .populate('noteCount')
      .sort({ name: 1 });

    res.json({
      success: true,
      message: 'Categories retrieved successfully',
      categories
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories'
    });
  }
};

// Get a single category by ID
const getCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, user: req.user.id })
      .populate('noteCount');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category retrieved successfully',
      category
    });
  } catch (error) {
    console.error('Error getting category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve category'
    });
  }
};

// Create a new category
const createCategory = async (req, res) => {
  try {
    // Validate request body
    const { error } = validateCategory(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { name, color } = req.body;

    // Check if category name already exists for this user
    const existingCategory = await Category.findOne({ name, user: req.user.id });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const category = new Category({
      name,
      color,
      user: req.user.id
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category'
    });
  }
};

// Update a category
const updateCategory = async (req, res) => {
  try {
    // Validate request body
    const { error } = validateCategory(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { name, color } = req.body;

    // Check if category exists and belongs to user
    const category = await Category.findOne({ _id: req.params.id, user: req.user.id });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if new name conflicts with existing category (excluding current category)
    if (name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name, 
        user: req.user.id,
        _id: { $ne: req.params.id }
      });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }

    // Update category
    category.name = name;
    category.color = color;

    await category.save();

    res.json({
      success: true,
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category'
    });
  }
};

// Delete a category
const deleteCategory = async (req, res) => {
  try {
    // Check if category exists and belongs to user
    const category = await Category.findOne({ _id: req.params.id, user: req.user.id });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has notes
    const noteCount = await Note.countDocuments({ category: req.params.id, user: req.user.id });
    if (noteCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${noteCount} note(s). Please move or delete the notes first.`
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category'
    });
  }
};

// Get category statistics
const getCategoryStats = async (req, res) => {
  try {
    const stats = await Note.aggregate([
      { $match: { user: req.user.id } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          pinnedCount: {
            $sum: { $cond: ['$isPinned', 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $project: {
          _id: 1,
          name: '$category.name',
          color: '$category.color',
          count: 1,
          pinnedCount: 1
        }
      },
      { $sort: { name: 1 } }
    ]);

    res.json({
      success: true,
      message: 'Category statistics retrieved successfully',
      stats
    });
  } catch (error) {
    console.error('Error getting category stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve category statistics'
    });
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats
}; 