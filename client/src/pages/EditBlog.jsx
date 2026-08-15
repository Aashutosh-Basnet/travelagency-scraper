import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { FiImage, FiArrowLeft, FiSave } from "react-icons/fi";

const SERVER_URL = "http://localhost:3000";

function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await API.get(`/blogs/${id}`);
        const blog = res.data;
        setTitle(blog.title || "");
        setBody(blog.body || "");
        if (blog.image) {
          setExistingImage(`${SERVER_URL}/upload/${blog.image}`);
        }
      } catch (err) {
        setError("Failed to load blog post for editing.");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError("Please fill in both title and body content.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("body", body);
      if (image) {
        formData.append("image", image);
      }

      await API.put(`/blogs/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate(`/blog/${id}`);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update blog post."
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex h-64 items-center justify-center font-medium text-neutral-500">
        Loading article...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 transition hover:text-neutral-900"
      >
        <FiArrowLeft size={16} /> Back
      </button>

      <div className="rounded-[28px] border border-black/10 bg-white p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
        <div className="mb-8 border-b border-black/10 pb-6">
          <h1 className="m-0 font-serif text-3xl font-bold tracking-tight text-[#181716] md:text-4xl">
            Edit Article
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Make updates to your published article.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              Title
            </label>
            <input
              type="text"
              placeholder="Article title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl border border-black/10 bg-neutral-50 px-4 py-3 font-serif text-xl font-bold text-neutral-900 outline-none transition focus:border-black focus:bg-white"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              Cover Image
            </label>
            <div className="flex flex-col gap-3">
              {(imagePreview || existingImage) && (
                <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-black/10 max-w-sm">
                  <img
                    src={imagePreview || existingImage}
                    alt="Cover preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <label className="flex w-max cursor-pointer items-center gap-2 rounded-xl border border-dashed border-black/20 bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100">
                <FiImage size={18} />
                <span>{existingImage ? "Replace Image" : "Upload Image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              Article Content
            </label>
            <textarea
              rows={12}
              placeholder="Article content..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="rounded-xl border border-black/10 bg-neutral-50 p-4 text-base leading-relaxed text-neutral-800 outline-none transition focus:border-black focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-black/10">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-full px-6 py-3 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-[#181716] px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
            >
              <FiSave size={18} />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBlog;
