import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { FiArrowLeft, FiEdit2, FiTrash2, FiClock } from "react-icons/fi";

const SERVER_URL = "http://localhost:3000";

function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await API.get(`/blogs/${id}`);
        setBlog(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load blog post.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) {
      return;
    }
    setDeleting(true);
    try {
      await API.delete(`/blogs/${id}`);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete blog post.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center font-medium text-neutral-500">
        Loading article details...
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h2 className="font-serif text-2xl font-bold text-neutral-800">
          Article Not Found
        </h2>
        <p className="mt-2 text-sm text-neutral-500">{error}</p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white no-underline"
        >
          <FiArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const isAuthor =
    user && (blog.author?._id === user.id || blog.author === user.id);
  const authorName = blog.author?.username || "Anonymous Writer";
  const authorAvatar = blog.author?.avatar
    ? `${SERVER_URL}/upload/${blog.author.avatar}`
    : null;
  const imageUrl = blog.image ? `${SERVER_URL}/upload/${blog.image}` : null;
  const formattedDate = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Recently published";

  const wordCount = blog.body ? blog.body.split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 transition hover:text-neutral-900"
      >
        <FiArrowLeft size={16} /> Back
      </button>

      {/* Header Info */}
      <div className="mb-6 flex flex-wrap items-center justify-end gap-4">
        {isAuthor && (
          <div className="flex items-center gap-3">
            <Link
              to={`/edit/${blog._id}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50 no-underline"
            >
              <FiEdit2 size={14} /> Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
            >
              <FiTrash2 size={14} /> {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>

      <h1 className="m-0 font-serif text-3xl font-bold tracking-tight text-[#181716] md:text-5xl leading-tight">
        {blog.title}
      </h1>

      {/* Author & Date Bar */}
      <div className="my-6 flex items-center gap-4 border-y border-black/10 py-4">
        {authorAvatar ? (
          <img
            src={authorAvatar}
            alt={authorName}
            className="h-12 w-12 rounded-full object-cover border border-black/10"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#181716] font-bold text-base text-white">
            {authorName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h4 className="m-0 text-base font-semibold text-neutral-900">
            {authorName}
          </h4>
          <p className="m-0 flex items-center gap-2 text-xs text-neutral-500 font-medium">
            <span>{formattedDate}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <FiClock size={12} /> {readTime} min read
            </span>
          </p>
        </div>
      </div>

      {/* Cover Image */}
      {imageUrl && (
        <div className="mb-8 overflow-hidden rounded-3xl border border-black/10">
          <img
            src={imageUrl}
            alt={blog.title}
            className="w-full max-h-[480px] object-cover"
          />
        </div>
      )}

      {/* Body Content */}
      <div className="prose max-w-none text-base md:text-lg leading-relaxed text-neutral-800 whitespace-pre-wrap font-sans">
        {blog.body}
      </div>
    </article>
  );
}

export default BlogDetail;
