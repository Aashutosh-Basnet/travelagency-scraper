import { Link } from "react-router-dom";
import { FiEdit2, FiTrash2, FiClock } from "react-icons/fi";

const SERVER_URL = "http://localhost:3000";

function BlogCard({ blog, currentUserId, onDelete }) {
  const isAuthor =
    currentUserId &&
    (blog.author?._id === currentUserId || blog.author === currentUserId);

  const formattedDate = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  // Calculate estimated read time
  const wordCount = blog.body ? blog.body.split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const authorName = blog.author?.username || "Anonymous Writer";
  const authorAvatar = blog.author?.avatar
    ? `${SERVER_URL}/upload/${blog.author.avatar}`
    : null;

  const imageUrl = blog.image ? `${SERVER_URL}/upload/${blog.image}` : null;

  return (
    <article className="group relative flex flex-col justify-between rounded-[24px] border border-black/10 bg-white p-6 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] md:flex-row md:items-center md:gap-8">
      <div className="flex flex-1 flex-col justify-between">
        <div>
          {/* Author Header */}
          <div className="mb-3 flex items-center gap-3">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className="h-8 w-8 rounded-full object-cover border border-black/10"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#181716] font-semibold text-xs text-white">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
              <span className="text-neutral-900 font-semibold">
                {authorName}
              </span>
              <span>•</span>
              <span>{formattedDate}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <FiClock size={12} /> {readTime} min read
              </span>
            </div>
          </div>

          {/* Title & Excerpt */}
          <Link to={`/blog/${blog._id}`} className="group/link block no-underline">
            <h2 className="m-0 mb-2 font-serif text-xl font-bold tracking-tight text-[#181716] transition group-hover/link:text-neutral-600 md:text-2xl">
              {blog.title}
            </h2>
            <p className="m-0 mb-4 line-clamp-2 text-sm leading-relaxed text-neutral-600">
              {blog.body}
            </p>
          </Link>
        </div>

        {/* Card Footer: Actions */}
        <div className="flex items-center justify-end gap-4 pt-2">
          {isAuthor && (
            <div className="flex items-center gap-2">
              <Link
                to={`/edit/${blog._id}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-black/5 hover:text-neutral-900"
                title="Edit Post"
              >
                <FiEdit2 size={16} />
              </Link>
              <button
                onClick={() => onDelete && onDelete(blog._id)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-red-500 transition hover:bg-red-50 hover:text-red-700"
                title="Delete Post"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Optional Featured Image */}
      {imageUrl && (
        <Link
          to={`/blog/${blog._id}`}
          className="mt-4 shrink-0 overflow-hidden rounded-2xl md:mt-0 md:w-44"
        >
          <img
            src={imageUrl}
            alt={blog.title}
            className="h-36 w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </Link>
      )}
    </article>
  );
}

export default BlogCard;
