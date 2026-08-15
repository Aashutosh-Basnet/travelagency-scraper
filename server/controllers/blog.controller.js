import Blog from "../models/blog.model.js";

// GET /api/blogs - Get all blogs
export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("author", "username email avatar")
      .sort({ createdAt: -1 });
    return res.json(blogs);
  } catch (error) {
    console.error("Get blogs error:", error);
    return res.status(500).json({ message: "Failed to fetch blogs." });
  }
};

// GET /api/blogs/:id - Get single blog by ID
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id).populate(
      "author",
      "username email avatar"
    );

    if (!blog) {
      return res.status(404).json({ message: "Blog post not found." });
    }

    return res.json(blog);
  } catch (error) {
    console.error("Get blog error:", error);
    return res.status(500).json({ message: "Failed to fetch blog post." });
  }
};

// POST /api/blogs - Create new blog
export const createBlog = async (req, res) => {
  try {
    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: "Title and body are required." });
    }

    const image = req.file ? req.file.filename : null;
    const authorId = req.session?.user?.id || req.session?.user?._id;

    if (!authorId) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Please log in first." });
    }

    const blog = await Blog.create({
      title,
      body,
      image,
      author: authorId,
    });

    const populatedBlog = await Blog.findById(blog._id).populate(
      "author",
      "username email avatar"
    );

    return res.status(201).json({
      message: "Blog created successfully.",
      blog: populatedBlog,
    });
  } catch (error) {
    console.error("Create blog error:", error);
    return res.status(500).json({ message: "Blog creation failed." });
  }
};

// PUT /api/blogs/:id - Update blog
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, body } = req.body;
    const userId = req.session?.user?.id || req.session?.user?._id;

    const existingBlog = await Blog.findById(id);
    if (!existingBlog) {
      return res.status(404).json({ message: "Blog not found." });
    }

    const authorIdStr = existingBlog.author?._id
      ? existingBlog.author._id.toString()
      : existingBlog.author.toString();

    if (!userId || authorIdStr !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You can only update your own blogs." });
    }

    const updateData = {};
    if (title !== undefined && title.trim() !== "") updateData.title = title;
    if (body !== undefined && body.trim() !== "") updateData.body = body;
    if (req.file) updateData.image = req.file.filename;

    const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("author", "username email avatar");

    return res.json({
      message: "Blog updated successfully.",
      blog: updatedBlog,
    });
  } catch (error) {
    console.error("Update blog error:", error);
    return res.status(500).json({ message: "Blog update failed." });
  }
};

// DELETE /api/blogs/:id - Delete blog
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session?.user?.id || req.session?.user?._id;

    const existingBlog = await Blog.findById(id);
    if (!existingBlog) {
      return res.status(404).json({ message: "Blog not found." });
    }

    const authorIdStr = existingBlog.author?._id
      ? existingBlog.author._id.toString()
      : existingBlog.author.toString();

    if (!userId || authorIdStr !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You can only delete your own blogs." });
    }

    await Blog.deleteOne({ _id: id });

    return res.json({ message: "Deleted successfully." });
  } catch (error) {
    console.error("Delete blog error:", error);
    return res.status(500).json({ message: "Deletion failed." });
  }
};