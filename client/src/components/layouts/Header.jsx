import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEdit3, FiUser, FiLogOut, FiHome } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const SERVER_URL = "http://localhost:3000";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate("/login");
  };

  const avatarUrl = user?.avatar
    ? `${SERVER_URL}/upload/${user.avatar}`
    : null;

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        {/* Brand Logo */}
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-inherit no-underline"
          aria-label="Blog Home"
        >
          <span className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#181716]">
            Medium
          </span>
        </Link>

        {/* Right Navigation & User Controls */}
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-black/5 md:inline-flex no-underline"
          >
            <FiHome size={16} />
            <span>Feed</span>
          </Link>

          {user ? (
            <>
              <Link
                to="/write"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#181716] px-4 py-2 text-xs font-semibold text-white no-underline shadow-sm transition hover:opacity-90"
              >
                <FiEdit3 size={15} />
                <span>Write</span>
              </Link>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-[#181716] text-white shadow-sm transition hover:scale-105"
                  aria-label="User Account"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={user.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold uppercase">
                      {user.username?.charAt(0) || "U"}
                    </span>
                  )}
                </button>

                {dropdownOpen && (
                  <div
                    onMouseLeave={() => setDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-48 rounded-2xl border border-black/10 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-2"
                  >
                    <div className="border-b border-black/5 px-3 py-2">
                      <p className="m-0 text-xs font-bold text-neutral-900 truncate">
                        {user.username}
                      </p>
                      <p className="m-0 text-[11px] text-neutral-500 truncate">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-100 no-underline"
                    >
                      <FiUser size={14} /> Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 text-left"
                    >
                      <FiLogOut size={14} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-black/5 no-underline"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-[#181716] px-4 py-2 text-xs font-semibold text-white no-underline shadow-sm transition hover:opacity-90"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;