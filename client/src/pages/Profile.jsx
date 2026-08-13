import { useState, useEffect } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import BlogCard from "../components/BlogCard";
import { FiCamera, FiUser, FiMail, FiEdit3 } from "react-icons/fi";

const SERVER_URL = "http://localhost:3000";

function Profile() {
  const { user, updateUserState } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);
  const [message, setMessage] = useState("");

  const fetchProfile = async () => {
    if (!user?.id) return;
    try {
      const res = await API.get(`/users/${user.id}`);
      setProfileData(res.data.user);
      setBlogs(res.data.blogs || []);
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.id) return;

    setUpdatingAvatar(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await API.put(`/users/${user.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.user) {
        setProfileData(res.data.user);
        updateUserState({ avatar: res.data.user.avatar });
        setMessage("Avatar updated successfully!");
      }
    } catch (err) {
      setMessage("Failed to update avatar.");
    } finally {
      setUpdatingAvatar(false);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) return;
    try {
      await API.delete(`/blogs/${blogId}`);
      setBlogs((prev) => prev.filter((b) => b._id !== blogId));
    } catch (err) {
      alert("Failed to delete blog post.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center font-medium text-neutral-500">
        Loading profile...
      </div>
    );
  }

  const currentUser = profileData || user;
  const avatarUrl = currentUser?.avatar
    ? `${SERVER_URL}/upload/${currentUser.avatar}`
    : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Profile Header */}
      <div className="mb-10 rounded-[28px] border border-black/10 bg-white p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
          {/* Avatar Upload */}
          <div className="relative group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={currentUser?.username}
                className="h-24 w-24 rounded-full object-cover border-2 border-black/10 shadow-sm"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#181716] font-bold text-3xl text-white">
                {currentUser?.username?.charAt(0).toUpperCase()}
              </div>
            )}
            <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black text-white shadow-md transition hover:scale-110">
              <FiCamera size={16} />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={updatingAvatar}
              />
            </label>
          </div>

          <div className="flex-1">
            <h1 className="m-0 font-serif text-2xl font-bold text-neutral-900 md:text-3xl">
              {currentUser?.username}
            </h1>
            <p className="mt-1 flex items-center justify-center sm:justify-start gap-2 text-sm text-neutral-500">
              <FiMail size={14} /> {currentUser?.email}
            </p>
            {message && (
              <p className="mt-2 text-xs font-semibold text-emerald-600">
                {message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* User's Published Articles */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="m-0 font-serif text-2xl font-bold tracking-tight text-neutral-900">
            Your Articles ({blogs.length})
          </h2>
        </div>

        {blogs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 bg-white p-12 text-center">
            <FiEdit3 size={32} className="mx-auto mb-3 text-neutral-400" />
            <h3 className="m-0 font-serif text-lg font-semibold text-neutral-800">
              No articles published yet
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              Write and share your first story today!
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {blogs.map((blog) => (
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
    </div>
  );
}

export default Profile;
