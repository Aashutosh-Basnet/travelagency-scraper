import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { FiImage, FiArrowLeft, FiPlusCircle } from "react-icons/fi";

function CreateBlog() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      setError("Please fill in both title and post body.");
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

      const res = await API.post("/blogs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.blog?._id) {
        navigate(`/blog/${res.data.blog._id}`);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to publish blog post."
      );
    } finally {
      setLoading(false);
    }
  };

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
            Publish New Article
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Share your story, thoughts, or knowledge with the community.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Title input */}
          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              Title
            </label>
            <input
              type="text"
              placeholder="Article title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl border border-black/10 bg-neutral-50 px-4 py-3 font-serif text-xl font-bold text-neutral-900 outline-none transition focus:border-black focus:bg-white placeholder:font-sans placeholder:text-neutral-400"
            />
          </div>

          {/* Cover image upload */}
          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              Cover Image (Optional)
            </label>
            <div className="flex items-center gap-4">
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-black/20 bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100">
                <FiImage size={18} />
                <span>Choose Cover Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imagePreview && (
                <div className="relative h-16 w-24 overflow-hidden rounded-xl border border-black/10">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Body content textarea */}
          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              Article Content
            </label>
            <textarea
              rows={12}
              placeholder="Tell your story..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="rounded-xl border border-black/10 bg-neutral-50 p-4 text-base leading-relaxed text-neutral-800 outline-none transition focus:border-black focus:bg-white placeholder:text-neutral-400"
            />
          </div>

          {/* Submit button */}
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
              <FiPlusCircle size={18} />
              {loading ? "Publishing..." : "Publish Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateBlog;
