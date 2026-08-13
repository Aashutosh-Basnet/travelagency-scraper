import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BlogCard from "../components/BlogCard";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { FiEdit3, FiSearch, FiRefreshCw } from "react-icons/fi";

function Dashboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBlogs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/blogs");
      setBlogs(res.data || []);
    } catch (err) {
      setError("Failed to fetch blog posts from backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) return;
    try {
      await API.delete(`/blogs/${blogId}`);
      setBlogs((prev) => prev.filter((b) => b._id !== blogId));
    } catch (err) {
      alert("Failed to delete blog post.");
    }
  };

  // Filter blogs based on search query
  const filteredBlogs = blogs.filter((blog) => {
    return (
      !searchQuery.trim() ||
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.body.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="mx-auto grid w-[min(1180px,calc(100%-2rem))] gap-8 pb-12 md:grid-cols-[minmax(0,1fr)_320px] pt-6">
      <section>
        {/* Header & Search section */}
        <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end border-b border-black/10 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Editorial Feed
            </span>
            <h1 className="m-0 font-serif text-[clamp(1.8rem,4vw,2.8rem)] tracking-tight font-bold text-[#181716]">
              Stories & Ideas
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
              <input
                type="text"
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-black/10 bg-white py-2 pl-9 pr-4 text-xs font-medium text-neutral-800 outline-none transition focus:border-black"
              />
            </div>

            {user && (
              <Link
                to="/write"
                className="inline-flex items-center gap-2 rounded-full bg-[#181716] px-4 py-2 text-xs font-semibold text-white no-underline shadow-sm transition hover:opacity-90 shrink-0"
              >
                <FiEdit3 size={14} /> Write
              </Link>
            )}
          </div>
        </div>

        {/* Stories List */}
        {loading ? (
          <div className="flex h-48 items-center justify-center font-medium text-neutral-500 gap-2">
            <FiRefreshCw className="animate-spin" size={18} /> Loading stories...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm font-medium text-red-700">
            {error}
            <button
              onClick={fetchBlogs}
              className="mt-3 block mx-auto rounded-full bg-red-700 px-4 py-1.5 text-xs text-white"
            >
              Retry
            </button>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 bg-white p-12 text-center">
            <h3 className="m-0 font-serif text-lg font-semibold text-neutral-800">
              No articles found
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              {searchQuery
                ? "Try clearing search keywords."
                : "Be the first author to publish a story!"}
            </p>
            {user && (
              <Link
                to="/write"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#181716] px-5 py-2 text-xs font-semibold text-white no-underline"
              >
                <FiEdit3 size={14} /> Write an article
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4" id="stories">
            {filteredBlogs.map((blog) => (
              <BlogCard
                key={blog._id}
                blog={blog}
                currentUserId={user?.id}
                onDelete={handleDeleteBlog}
              />
            ))}
          </div>
        )}
      </section>

      {/* Sidebar / Trending */}
      <aside className="grid gap-4 self-start md:sticky md:top-24" id="topics">
        <div className="rounded-[24px] border border-black/10 bg-white/70 p-5 shadow-[0_20px_60px_rgba(17,17,17,0.04)]">
          <span className="mb-4 inline-block rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Trending Stories
          </span>
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {[
              ["01", "Clean Editorial Layouts", "Modern typography & simple CRUD architecture."],
              ["02", "Session Auth & Uploads", "Express sessions with MongoDB storage and Multer image file uploads."],
              ["03", "React & Tailwind V4", "Seamless user interface built with speed and elegance."],
            ].map(([index, title, copy]) => (
              <li key={index} className="grid grid-cols-[auto_1fr] gap-3">
                <span className="font-serif text-3xl font-bold leading-none text-black/20">{index}</span>
                <div>
                  <h4 className="m-0 mb-1 text-sm font-bold text-neutral-900">{title}</h4>
                  <p className="m-0 text-xs leading-relaxed text-neutral-500">{copy}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}

export default Dashboard;