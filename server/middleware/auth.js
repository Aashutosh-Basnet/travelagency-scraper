const User = require('../models/User');

const requireAuth = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Authentication required. Please log in.' });
    }

    const user = await User.findById(req.session.userId).select('-passwordHash');
    if (!user) {
      // Session exists but user was deleted
      req.session.destroy(() => {});
      return res.status(401).json({ message: 'User account not found. Please log in again.' });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Internal server error during authentication.' });
  }
};

module.exports = { requireAuth };
