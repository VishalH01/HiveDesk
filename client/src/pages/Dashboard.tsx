import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { apiService } from "../services/apiService";

interface User {
  id: string;
  name: string;
  email: string;
  birthday: string;
  isVerified: boolean;
  lastLogin?: string;
  createdAt?: string;
}

interface Note {
  _id: string;
  title: string;
  content: string;
  category: string | { _id: string; name: string; color: string };
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  _id: string;
  name: string;
  color: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [gridLayout, setGridLayout] = useState<'2' | '3' | '4'>('3');
  
  // Debug grid layout changes
  useEffect(() => {
    console.log('Grid layout changed to:', gridLayout);
  }, [gridLayout]);
  
  // Form states
  const [noteForm, setNoteForm] = useState({
    title: "",
    content: "",
    category: "",
    tags: "",
    isPinned: false
  });
  
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    color: "#3B82F6"
  });

  // Validation states
  const [noteErrors, setNoteErrors] = useState<{[key: string]: string}>({});
  const [categoryErrors, setCategoryErrors] = useState<{[key: string]: string}>({});

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/signin');
          return;
        }

        const result = await apiService.getCurrentUser();
        if (result.success && result.user) {
          setUser(result.user);
          await loadNotes();
          await loadCategories();
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('keepLoggedIn');
          navigate('/signin');
        }
      } catch (error: unknown) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('keepLoggedIn');
        navigate('/signin');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Debug form state changes
  useEffect(() => {
    console.log('Form state changed:', noteForm);
  }, [noteForm]);

  const loadNotes = async () => {
    setIsLoadingNotes(true);
    try {
      const result = await apiService.getNotes();
      if (result.success) {
        setNotes(result.notes || []);
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const loadCategories = async () => {
    try {
      const result = await apiService.getCategories();
      if (result.success) {
        setCategories(result.categories || []);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const validateNoteForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!noteForm.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!noteForm.content.trim()) {
      errors.content = 'Content is required';
    }
    
    if (!noteForm.category) {
      errors.category = 'Please select a category';
    }
    
    setNoteErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateCategoryForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!categoryForm.name.trim()) {
      errors.name = 'Category name is required';
    }
    
    setCategoryErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateNote = async () => {
    // Clear previous errors
    setNoteErrors({});
    
    // Validate form
    if (!validateNoteForm()) {
      return;
    }

    try {
      const tags = noteForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      const result = await apiService.createNote({
        ...noteForm,
        tags
      });
      
      if (result.success) {
        toast.success('Note created successfully!');
        setShowCreateNote(false);
        resetNoteForm();
        await loadNotes();
      } else {
        // Handle backend validation errors
        if (result.errors && Array.isArray(result.errors)) {
          const backendErrors: {[key: string]: string} = {};
          result.errors.forEach((error: any) => {
            backendErrors[error.field] = error.message;
          });
          setNoteErrors(backendErrors);
        } else {
          toast.error(result.message || 'Failed to create note');
        }
      }
    } catch (error) {
      toast.error('Failed to create note');
    }
  };

  const resetNoteForm = () => {
    setNoteForm({ title: "", content: "", category: "", tags: "", isPinned: false });
    setNoteErrors({});
  };

  const handleUpdateNote = async () => {
    // Clear previous errors
    setNoteErrors({});
    
    // Validate form
    if (!validateNoteForm()) {
      return;
    }

    if (!editingNote) return;

    try {
      const tags = noteForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      const result = await apiService.updateNote(editingNote._id, {
        ...noteForm,
        tags
      });
      
      if (result.success) {
        toast.success('Note updated successfully!');
        setShowCreateNote(false);
        setEditingNote(null);
        resetNoteForm();
        await loadNotes();
      } else {
        // Handle backend validation errors
        if (result.errors && Array.isArray(result.errors)) {
          const backendErrors: {[key: string]: string} = {};
          result.errors.forEach((error: any) => {
            backendErrors[error.field] = error.message;
          });
          setNoteErrors(backendErrors);
        } else {
          toast.error(result.message || 'Failed to update note');
        }
      }
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        const result = await apiService.deleteNote(noteId);
        if (result.success) {
          toast.success('Note deleted successfully!');
          await loadNotes();
        } else {
          toast.error(result.message || 'Failed to delete note');
        }
      } catch (error) {
        toast.error('Failed to delete note');
      }
    }
  };

  const handleCreateCategory = async () => {
    // Clear previous errors
    setCategoryErrors({});
    
    // Validate form
    if (!validateCategoryForm()) {
      return;
    }

    try {
      const result = await apiService.createCategory(categoryForm);
      
      if (result.success) {
        toast.success('Category created successfully!');
        setShowCreateCategory(false);
        setCategoryForm({ name: "", color: "#3B82F6" });
        await loadCategories();
      } else {
        // Handle backend validation errors
        if (result.errors && Array.isArray(result.errors)) {
          const backendErrors: {[key: string]: string} = {};
          result.errors.forEach((error: any) => {
            backendErrors[error.field] = error.message;
          });
          setCategoryErrors(backendErrors);
        } else {
          toast.error(result.message || 'Failed to create category');
        }
      }
    } catch (error) {
      toast.error('Failed to create category');
    }
  };

  const handleUpdateCategory = async () => {
    // Clear previous errors
    setCategoryErrors({});
    
    // Validate form
    if (!validateCategoryForm()) {
      return;
    }

    if (!editingCategory) return;

    try {
      const result = await apiService.updateCategory(editingCategory._id, categoryForm);
      
      if (result.success) {
        toast.success('Category updated successfully!');
        setShowCreateCategory(false);
        setEditingCategory(null);
        setCategoryForm({ name: "", color: "#3B82F6" });
        await loadCategories();
      } else {
        // Handle backend validation errors
        if (result.errors && Array.isArray(result.errors)) {
          const backendErrors: {[key: string]: string} = {};
          result.errors.forEach((error: any) => {
            backendErrors[error.field] = error.message;
          });
          setCategoryErrors(backendErrors);
        } else {
          toast.error(result.message || 'Failed to update category');
        }
      }
    } catch (error) {
      toast.error('Failed to update category');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category? This will also delete all notes in this category.')) {
      try {
        const result = await apiService.deleteCategory(categoryId);
        if (result.success) {
          toast.success('Category deleted successfully!');
          await loadCategories();
          await loadNotes(); // Reload notes as some might have been deleted
        } else {
          toast.error(result.message || 'Failed to delete category');
        }
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setShowCreateNote(true);
    setNoteForm({
      title: note.title,
      content: note.content,
      category: typeof note.category === 'string' ? note.category : note.category._id,
      tags: note.tags.join(', '),
      isPinned: note.isPinned
    });
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowCreateCategory(true);
    setCategoryForm({
      name: category.name,
      color: category.color
    });
  };

  const handleQuickPinToggle = async (note: Note) => {
    try {
      // Extract the category ID properly
      const categoryId = typeof note.category === 'string' ? note.category : note.category._id;
      
      const result = await apiService.updateNote(note._id, {
        title: note.title,
        content: note.content,
        category: categoryId,
        tags: note.tags,
        isPinned: !note.isPinned
      });
      
      if (result.success) {
        toast.success(note.isPinned ? 'Note unpinned!' : 'Note pinned!');
        await loadNotes();
      } else {
        toast.error('Failed to update note');
      }
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const handleMoveNoteToCategory = async (noteId: string, newCategoryId: string) => {
    try {
      console.log('Moving note:', { noteId, newCategoryId });
      const note = notes.find(n => n._id === noteId);
      if (!note) {
        console.log('Note not found:', noteId);
        return;
      }

      const categoryId = typeof note.category === 'string' ? note.category : note.category._id;
      
      // Don't move if it's already in the same category
      if (categoryId === newCategoryId) {
        console.log('Note already in category:', categoryId);
        return;
      }
      
      const result = await apiService.updateNote(noteId, {
        title: note.title,
        content: note.content,
        category: newCategoryId,
        tags: note.tags,
        isPinned: note.isPinned
      });
      
      if (result.success) {
        toast.success('Note moved successfully!');
        await loadNotes();
      } else {
        toast.error('Failed to move note');
      }
    } catch (error) {
      console.error('Error moving note:', error);
      toast.error('Failed to move note');
    }
  };

  const handleCancelEdit = () => {
    setShowCreateNote(false);
    setEditingNote(null);
    resetNoteForm();
  };

  const handleSignOut = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('keepLoggedIn');
    toast.success('Signed out successfully!');
    navigate('/');
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Handle both string and object category types
    const noteCategoryId = typeof note.category === 'string' ? note.category : note.category._id;
    const matchesCategory = selectedCategory === "all" || noteCategoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const pinnedNotes = filteredNotes.filter(note => note.isPinned);
  const unpinnedNotes = filteredNotes.filter(note => !note.isPinned);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Modern Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <img src="/src/assets/logo_1.png" alt="HiveDesk Logo" className="w-full h-full" />
              </div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Welcome, {user.name}!</span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Welcome, {user.name}!</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">My Notes</h2>
                <p className="text-gray-600">Organize your thoughts and ideas</p>
              </div>
              <div className="flex flex-row gap-3">
                {/* Grid Layout Toggle - Desktop Only */}
                <div className="hidden lg:flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <span className="text-xs text-gray-500 mr-2">Layout:</span>
                  <button
                    onClick={() => {
                      console.log('Setting grid layout to 2');
                      setGridLayout('2');
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer ${
                      gridLayout === '2'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                    title="2 columns layout"
                  >
                    2
                  </button>
                  <button
                    onClick={() => {
                      console.log('Setting grid layout to 3');
                      setGridLayout('3');
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer ${
                      gridLayout === '3'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                    title="3 columns layout"
                  >
                    3
                  </button>
                  <button
                    onClick={() => {
                      console.log('Setting grid layout to 4');
                      setGridLayout('4');
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer ${
                      gridLayout === '4'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                    title="4 columns layout"
                  >
                    4
                  </button>
                </div>
                
                <button
                  onClick={() => setShowCreateCategory(true)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  New Category
                </button>
                <button
                  onClick={() => setShowCreateNote(true)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Note
                </button>
              </div>
            </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search notes, tags, or content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  />
                </div>
              </div>
              <div className="lg:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>


        </div>

        {/* Notes Grid */}
        {isLoadingNotes ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Loading notes...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Desktop: Category-based Drag & Drop Layout */}
            <div className="hidden lg:block">
              {categories.length > 0 ? (
                <div className={`grid gap-4 ${
                  gridLayout === '2' 
                    ? 'grid-cols-1 lg:grid-cols-2' 
                    : gridLayout === '3'
                    ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
                    : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-4'
                }`}>
                  {categories.map(category => {
                    const categoryNotes = filteredNotes.filter(note => {
                      const noteCategoryId = typeof note.category === 'string' ? note.category : note.category._id;
                      return noteCategoryId === category._id;
                    });
                    
                    return (
                      <CategoryDropZone
                        key={category._id}
                        category={category}
                        notes={categoryNotes}
                        allNotes={filteredNotes}
                        onEditNote={handleEditNote}
                        onDeleteNote={handleDeleteNote}
                        onPinToggle={handleQuickPinToggle}
                        onEditCategory={handleEditCategory}
                        onDeleteCategory={handleDeleteCategory}
                        onMoveNote={(noteId: string, newCategoryId: string) => {
                          // Handle note category change
                          const note = notes.find(n => n._id === noteId);
                          if (note) {
                            const categoryId = typeof note.category === 'string' ? note.category : note.category._id;
                            if (categoryId !== newCategoryId) {
                              handleMoveNoteToCategory(noteId, newCategoryId);
                            }
                          }
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">No categories yet</p>
                  <button
                    onClick={() => setShowCreateCategory(true)}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Your First Category
                  </button>
                </div>
              )}
            </div>

            {/* Mobile: Traditional Grid Layout */}
            <div className="lg:hidden">
              {/* Pinned Notes */}
              {pinnedNotes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
                    </svg>
                    Pinned Notes
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {pinnedNotes.map(note => (
                      <NoteCard
                        key={note._id}
                        note={note}
                        category={categories.find(c => c._id === note.category)}
                        onEdit={() => handleEditNote(note)}
                        onDelete={() => handleDeleteNote(note._id)}
                        onPinToggle={() => handleQuickPinToggle(note)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Notes */}
              {unpinnedNotes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">All Notes</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {unpinnedNotes.map(note => (
                      <NoteCard
                        key={note._id}
                        note={note}
                        category={categories.find(c => c._id === note.category)}
                        onEdit={() => handleEditNote(note)}
                        onDelete={() => handleDeleteNote(note._id)}
                        onPinToggle={() => handleQuickPinToggle(note)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {filteredNotes.length === 0 && (
                <div className="text-center py-16">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    {searchTerm || selectedCategory !== "all" 
                      ? "Try adjusting your search or filter criteria."
                      : "Get started by creating your first note to organize your thoughts and ideas."}
                  </p>
                  <button
                    onClick={() => setShowCreateNote(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Your First Note
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Note Modal */}
      {(showCreateNote || editingNote) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {editingNote ? 'Edit Note' : 'Create New Note'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowCreateNote(false);
                      handleCancelEdit();
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={noteForm.title}
                      onChange={(e) => {
                        console.log('Title changed:', e.target.value);
                        setNoteForm({...noteForm, title: e.target.value});
                        if (noteErrors.title) {
                          setNoteErrors({...noteErrors, title: ''});
                        }
                      }}
                      className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200 ${
                        noteErrors.title 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:border-indigo-500'
                      }`}
                      placeholder="Enter note title"
                    />
                    {noteErrors.title && (
                      <p className="text-red-500 text-xs mt-1">{noteErrors.title}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={noteForm.content}
                      onChange={(e) => {
                        console.log('Content changed:', e.target.value);
                        setNoteForm({...noteForm, content: e.target.value});
                        if (noteErrors.content) {
                          setNoteErrors({...noteErrors, content: ''});
                        }
                      }}
                      rows={6}
                      className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200 ${
                        noteErrors.content 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:border-indigo-500'
                      }`}
                      placeholder="Write your note content here..."
                    />
                    {noteErrors.content && (
                      <p className="text-red-500 text-xs mt-1">{noteErrors.content}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={noteForm.category}
                      onChange={(e) => {
                        console.log('Category changed:', e.target.value);
                        setNoteForm({...noteForm, category: e.target.value});
                        if (noteErrors.category) {
                          setNoteErrors({...noteErrors, category: ''});
                        }
                      }}
                      className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200 ${
                        noteErrors.category 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:border-indigo-500'
                      }`}
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {noteErrors.category && (
                      <p className="text-red-500 text-xs mt-1">{noteErrors.category}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={noteForm.tags}
                      onChange={(e) => {
                        console.log('Tags changed:', e.target.value);
                        setNoteForm({...noteForm, tags: e.target.value});
                      }}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                      placeholder="work, ideas, todo"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPinned"
                      checked={noteForm.isPinned}
                      onChange={(e) => {
                        console.log('Pinned changed:', e.target.checked);
                        setNoteForm({...noteForm, isPinned: e.target.checked});
                      }}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPinned" className="ml-2 block text-sm text-gray-900">
                      Pin this note
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowCreateNote(false);
                      handleCancelEdit();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingNote ? handleUpdateNote : handleCreateNote}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {editingNote ? 'Update Note' : 'Create Note'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Category Modal */}
      {(showCreateCategory || editingCategory) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {editingCategory ? 'Edit Category' : 'Create New Category'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowCreateCategory(false);
                      setEditingCategory(null);
                      setCategoryForm({ name: "", color: "#3B82F6" });
                      setCategoryErrors({});
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => {
                        setCategoryForm({...categoryForm, name: e.target.value});
                        if (categoryErrors.name) {
                          setCategoryErrors({...categoryErrors, name: ''});
                        }
                      }}
                      className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200 ${
                        categoryErrors.name 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:border-indigo-500'
                      }`}
                      placeholder="Enter category name"
                    />
                    {categoryErrors.name && (
                      <p className="text-red-500 text-xs mt-1">{categoryErrors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <input
                      type="color"
                      value={categoryForm.color}
                      onChange={(e) => setCategoryForm({...categoryForm, color: e.target.value})}
                      className="block w-full h-12 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowCreateCategory(false);
                      setEditingCategory(null);
                      setCategoryForm({ name: "", color: "#3B82F6" });
                      setCategoryErrors({});
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Modern Note Card Component
const NoteCard = ({ note, category, onEdit, onDelete, onPinToggle }: {
  note: Note;
  category?: Category;
  onEdit: () => void;
  onDelete: () => void;
  onPinToggle: () => void;
}) => {
  return (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 pr-2 group-hover:text-indigo-600 transition-colors duration-200">
            {note.title}
          </h3>
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={onPinToggle}
              className={`p-1 rounded-lg transition-all duration-200 ${
                note.isPinned 
                  ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100' 
                  : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
              }`}
              title={note.isPinned ? 'Unpin note' : 'Pin note'}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
              </svg>
            </button>
            <button
              onClick={onEdit}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
              title="Edit note"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={onDelete}
              className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
              title="Delete note"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
          {note.content}
        </p>
        
        {category && (
          <div className="flex items-center mb-3">
            <div
              className="w-3 h-3 rounded-full mr-2 shadow-sm"
              style={{ backgroundColor: category.color }}
            ></div>
            <span className="text-xs font-medium text-gray-600">{category.name}</span>
          </div>
        )}
        
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {note.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-100">
          <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
          {note.isPinned && (
            <div className="flex items-center text-yellow-500">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
              </svg>
              <span>Pinned</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};



// Category Card Component with Responsive Actions
const CategoryCard = ({ category, onEdit, onDelete }: {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="group flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
      <div className="flex items-center space-x-2">
        <div
          className="w-3 h-3 rounded-full shadow-sm"
          style={{ backgroundColor: category.color }}
        ></div>
        <span className="text-sm font-medium text-gray-700">{category.name}</span>
      </div>
      
      {/* Desktop: Hover buttons (hidden on mobile) */}
      <div className="hidden md:flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={onEdit}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors duration-200"
          title="Edit category"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
          title="Delete category"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Mobile: Dropdown button (hidden on desktop) */}
      <div className="md:hidden relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors duration-200"
          title="More options"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>

        {/* Mobile Dropdown Menu */}
        {showDropdown && (
          <>
            {/* Backdrop to close dropdown */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowDropdown(false)}
            />
            
            {/* Dropdown Content */}
            <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
              <button
                onClick={() => {
                  onEdit();
                  setShowDropdown(false);
                }}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setShowDropdown(false);
                }}
                className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Draggable Category Card Component for Desktop
const DraggableCategoryCard = ({ 
  category, 
  index, 
  onEdit, 
  onDelete, 
  onMove 
}: {
  category: Category;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (fromIndex: number, toIndex: number) => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (fromIndex !== index) {
      onMove(fromIndex, index);
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        relative group cursor-move
        p-4 rounded-xl border-2 border-dashed transition-all duration-200
        ${isDragging 
          ? 'border-indigo-400 bg-indigo-50 scale-105 shadow-lg' 
          : dragOver 
            ? 'border-indigo-300 bg-indigo-25' 
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
        }
      `}
    >
      {/* Drag Handle */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>

      {/* Category Content */}
      <div className="flex flex-col items-center text-center space-y-3">
        {/* Color Circle */}
        <div 
          className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center"
          style={{ backgroundColor: category.color }}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>

        {/* Category Name */}
        <h4 className="font-semibold text-gray-900 text-sm">{category.name}</h4>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="Edit category"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="Delete category"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-indigo-100 bg-opacity-50 rounded-xl flex items-center justify-center">
          <div className="text-indigo-600 font-medium">Moving...</div>
        </div>
      )}
    </div>
  );
};

// Category Drop Zone Component for Desktop Drag & Drop
const CategoryDropZone = ({ 
  category, 
  notes, 
  allNotes,
  onEditNote, 
  onDeleteNote, 
  onPinToggle,
  onMoveNote,
  onEditCategory,
  onDeleteCategory
}: {
  category: Category;
  notes: Note[];
  allNotes: Note[];
  onEditNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onPinToggle: (note: Note) => void;
  onMoveNote: (noteId: string, newCategoryId: string) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedNote, setDraggedNote] = useState<Note | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
    console.log('Drag over category:', category.name);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only reset if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const noteId = e.dataTransfer.getData('text/plain');
    console.log('Drop event:', { noteId, categoryId: category._id });
    if (noteId) {
      onMoveNote(noteId, category._id);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
              className={`
        group bg-white rounded-lg border-2 border-dashed transition-all duration-200 p-3
        ${isDragOver 
          ? 'border-indigo-400 bg-indigo-50 scale-105 shadow-lg' 
          : 'border-gray-200 hover:border-gray-300'
        }
      `}
    >
      {/* Category Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full shadow-sm"
            style={{ backgroundColor: category.color }}
          ></div>
          <h3 className="font-medium text-gray-900 text-sm">{category.name}</h3>
          <span className="text-xs text-gray-500">({notes.length})</span>
        </div>
        
        {/* Category Action Buttons */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditCategory(category);
            }}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors duration-200"
            title="Edit category"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteCategory(category._id);
            }}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
            title="Delete category"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Notes Container */}
      <div className="space-y-2 min-h-[150px]">
        {notes.length > 0 ? (
          notes.map(note => (
            <DraggableNoteCard
              key={note._id}
              note={note}
              category={category}
              onEdit={() => onEditNote(note)}
              onDelete={() => onDeleteNote(note._id)}
              onPinToggle={() => onPinToggle(note)}
              onDragStart={(note) => setDraggedNote(note)}
              onDragEnd={() => setDraggedNote(null)}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-24 text-gray-400">
            <div className="text-center">
              <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-xs">Drop notes here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Draggable Note Card Component
const DraggableNoteCard = ({ 
  note, 
  category, 
  onEdit, 
  onDelete, 
  onPinToggle,
  onDragStart,
  onDragEnd
}: {
  note: Note;
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
  onPinToggle: () => void;
  onDragStart: (note: Note) => void;
  onDragEnd: () => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    onDragStart(note);
    e.dataTransfer.setData('text/plain', note._id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
    console.log('Drag start:', { noteId: note._id, noteTitle: note.title });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd();
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`
        group bg-gray-50 rounded-md p-2 cursor-move transition-all duration-200
        ${isDragging 
          ? 'opacity-50 scale-95 shadow-lg' 
          : 'hover:bg-gray-100 hover:shadow-sm'
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-xs truncate mb-1">
            {note.title}
          </h4>
          <p className="text-gray-600 text-xs line-clamp-1 mb-1">
            {note.content}
          </p>
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {note.tags.slice(0, 1).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700"
                >
                  {tag}
                </span>
              ))}
              {note.tags.length > 1 && (
                <span className="text-xs text-gray-500">+{note.tags.length - 1}</span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1 ml-2">
          {/* Pin button - always visible when pinned, hover only when unpinned */}
          <div className={`transition-opacity duration-200 ${
            note.isPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPinToggle();
              }}
              className={`p-1 rounded transition-colors duration-200 ${
                note.isPinned 
                  ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50' 
                  : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
              }`}
              title={note.isPinned ? 'Unpin note' : 'Pin note'}
            >
              <svg className="w-3.5 h-3.5" fill={note.isPinned ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
          
          {/* Edit and Delete buttons - only visible on hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors duration-200"
              title="Edit note"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
              title="Delete note"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 