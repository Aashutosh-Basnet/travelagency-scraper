const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Post = require('../models/Post');

// Helper to safely delete an uploaded file
const deleteUploadedFile = (imagePath) => {
  if (!imagePath) return;
  try {
    const filename = path.basename(imagePath);
    const fullPath = path.join(__dirname, '..', 'uploads', filename);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.error('Error deleting cover image file:', err.message);
  }
};

// Helper to normalize tags input (handles JSON string, comma-separated string, or array)
const parseTags = (tagsInput) => {
  if (!tagsInput) return [];
  if (Array.isArray(tagsInput)) {
    return tagsInput.map((t) => String(t).trim()).filter(Boolean);
  }
  if (typeof tagsInput === 'string') {
    try {
      const parsed = JSON.parse(tagsInput);
      if (Array.isArray(parsed)) {
        return parsed.map((t) => String(t).trim()).filter(Boolean);
      }
    } catch {
      // If not JSON, split by comma
      return tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }
  }
  return [];
};

// @desc    Get public feed (published posts only)
// @route   GET /api/posts/public
// @access  Public
const getPublicFeed = async (req, res) => {
  try {
    const { search, tag } = req.query;
    const query = { status: 'published' };

    if (tag && tag.trim()) {
      query.tags = { $in: [tag.trim()] };
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { content: searchRegex }, { tags: searchRegex }];
    }

    const posts = await Post.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error('getPublicFeed error:', error);
    return res.status(500).json({ message: 'Error retrieving public feed' });
  }
};

// @desc    Get single public post
// @route   GET /api/posts/public/:id
// @access  Public
const getPublicPostById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID format' });
    }

    const post = await Post.findOne({ _id: id, status: 'published' }).populate('author', 'name email');

    if (!post) {
      return res.status(404).json({ message: 'Post not found or is currently not published' });
    }

    return res.status(200).json({ post });
  } catch (error) {
    console.error('getPublicPostById error:', error);
    return res.status(500).json({ message: 'Error retrieving post' });
  }
};

// @desc    Get all posts belonging to the logged-in user
// @route   GET /api/posts
// @access  Private (requireAuth)
const getUserPosts = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = { author: req.session.userId };

    if (status && ['draft', 'published'].includes(status)) {
      query.status = status;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { content: searchRegex }, { tags: searchRegex }];
    }

    const posts = await Post.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error('getUserPosts error:', error);
    return res.status(500).json({ message: 'Error retrieving your posts' });
  }
};

// @desc    Get single post by ID (only if belonging to logged-in user)
// @route   GET /api/posts/:id
// @access  Private (requireAuth)
const getUserPostById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID format' });
    }

    const post = await Post.findById(id).populate('author', 'name email');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check ownership
    if (post.author._id.toString() !== req.session.userId.toString()) {
      return res.status(403).json({ message: 'Access forbidden: You do not own this post' });
    }

    return res.status(200).json({ post });
  } catch (error) {
    console.error('getUserPostById error:', error);
    return res.status(500).json({ message: 'Error retrieving post' });
  }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private (requireAuth)
const createPost = async (req, res) => {
  try {
    const { title, content, tags, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Post title is required' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Post content is required' });
    }

    let coverImageUrl = '';
    if (req.file) {
      coverImageUrl = `/uploads/${req.file.filename}`;
    }

    const postStatus = status === 'draft' ? 'draft' : 'published';
    const parsedTags = parseTags(tags);

    const post = await Post.create({
      title: title.trim(),
      content: content.trim(),
      author: req.session.userId,
      tags: parsedTags,
      coverImage: coverImageUrl,
      status: postStatus,
    });

    const populatedPost = await Post.findById(post._id).populate('author', 'name email');

    return res.status(201).json({
      message: 'Post created successfully',
      post: populatedPost,
    });
  } catch (error) {
    console.error('createPost error:', error);
    // Cleanup uploaded file on error
    if (req.file) {
      deleteUploadedFile(req.file.filename);
    }
    return res.status(500).json({ message: 'Error creating post: ' + error.message });
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private (requireAuth)
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID format' });
    }

    const post = await Post.findById(id);

    if (!post) {
      if (req.file) deleteUploadedFile(req.file.filename);
      return res.status(404).json({ message: 'Post not found' });
    }

    // Verify ownership
    if (post.author.toString() !== req.session.userId.toString()) {
      if (req.file) deleteUploadedFile(req.file.filename);
      return res.status(403).json({ message: 'Access forbidden: You cannot edit another user\'s post' });
    }

    const { title, content, tags, status, removeCoverImage } = req.body;

    if (title !== undefined) {
      if (!title.trim()) return res.status(400).json({ message: 'Title cannot be empty' });
      post.title = title.trim();
    }

    if (content !== undefined) {
      if (!content.trim()) return res.status(400).json({ message: 'Content cannot be empty' });
      post.content = content.trim();
    }

    if (status !== undefined) {
      if (!['draft', 'published'].includes(status)) {
        return res.status(400).json({ message: 'Status must be either "draft" or "published"' });
      }
      post.status = status;
    }

    if (tags !== undefined) {
      post.tags = parseTags(tags);
    }

    // Handle cover image replacement or removal
    if (req.file) {
      if (post.coverImage) {
        deleteUploadedFile(post.coverImage);
      }
      post.coverImage = `/uploads/${req.file.filename}`;
    } else if (removeCoverImage === 'true' || removeCoverImage === true) {
      if (post.coverImage) {
        deleteUploadedFile(post.coverImage);
      }
      post.coverImage = '';
    }

    await post.save();
    const updatedPost = await Post.findById(post._id).populate('author', 'name email');

    return res.status(200).json({
      message: 'Post updated successfully',
      post: updatedPost,
    });
  } catch (error) {
    console.error('updatePost error:', error);
    if (req.file) deleteUploadedFile(req.file.filename);
    return res.status(500).json({ message: 'Error updating post: ' + error.message });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (requireAuth)
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID format' });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Verify ownership
    if (post.author.toString() !== req.session.userId.toString()) {
      return res.status(403).json({ message: 'Access forbidden: You cannot delete another user\'s post' });
    }

    // Remove cover image from disk if exists
    if (post.coverImage) {
      deleteUploadedFile(post.coverImage);
    }

    await Post.deleteOne({ _id: id });

    return res.status(200).json({ message: 'Post deleted successfully', id });
  } catch (error) {
    console.error('deletePost error:', error);
    return res.status(500).json({ message: 'Error deleting post: ' + error.message });
  }
};

module.exports = {
  getPublicFeed,
  getPublicPostById,
  getUserPosts,
  getUserPostById,
  createPost,
  updatePost,
  deletePost,
};
