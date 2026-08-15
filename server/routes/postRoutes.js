const express = require('express');
const router = express.Router();
const {
  getPublicFeed,
  getPublicPostById,
  getUserPosts,
  getUserPostById,
  createPost,
  updatePost,
  deletePost,
} = require('../controllers/postController');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes (Feed)
router.get('/public', getPublicFeed);
router.get('/public/:id', getPublicPostById);

// Protected routes (User Posts Management)
router.use(requireAuth);

router.get('/', getUserPosts);
router.get('/:id', getUserPostById);
router.post('/', upload.single('coverImage'), createPost);
router.put('/:id', upload.single('coverImage'), updatePost);
router.delete('/:id', deletePost);

module.exports = router;
