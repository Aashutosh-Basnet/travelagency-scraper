import User from "../models/user.model.js";
import Blog from "../models/blog.model.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: "User fetching failed." });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const blogs = await Blog.find({ author: id })
      .populate("author", "username email avatar")
      .sort({ createdAt: -1 });

    return res.json({
      user,
      blogs,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve user." });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, bio } = req.body;

    if (req.session?.user?.id !== id) {
      return res
        .status(403)
        .json({ message: "You can only update your own profile." });
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (req.file) updateData.avatar = req.file.filename;

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password");

    if (req.session?.user) {
      req.session.user.username = user.username;
      req.session.user.avatar = user.avatar;
    }

    return res.json({ message: "Profile updated successfully.", user });
  } catch (error) {
    return res.status(500).json({ message: "Profile update failed." });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.session?.user?.id !== id) {
      return res
        .status(403)
        .json({ message: "You can only delete your own account." });
    }

    await Blog.deleteMany({ author: id });
    await User.deleteOne({ _id: id });
    req.session.destroy();

    return res.json({ message: "Account deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Deletion failed." });
  }
};