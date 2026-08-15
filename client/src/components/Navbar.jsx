import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ThemeToggle from './ThemeToggle';
import {
  PenSquare,
  LayoutDashboard,
  Compass,
  LogOut,
  User as UserIcon,
  Sparkles,
  Menu,
  X,
  BookOpen,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.info('You have logged out.');
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navLinkClasses = ({ isActive }) =>
    `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold tracking-tight transition-all duration-150 ${
      isActive
        ? 'text-violet-500 dark:text-violet-400 bg-violet-500/10 border border-violet-500/20 shadow-2xs'
        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-white/[0.08] bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-3 text-neutral-900 dark:text-white font-extrabold text-lg tracking-tight hover:opacity-90 transition-opacity group"
          >
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-glow-violet group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="leading-none text-base font-black tracking-tight">Editorial</span>
              <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-0.5">
                Modern Journal
              </span>
            </div>
          </Link>

          {/* Main Navigation for Desktop */}
          <nav className="hidden md:flex items-center gap-1.5">
            <NavLink to="/" className={navLinkClasses} end>
              <Compass className="w-4 h-4" />
              <span>Explore Feed</span>
            </NavLink>
            {user && (
              <NavLink to="/dashboard" className={navLinkClasses}>
                <LayoutDashboard className="w-4 h-4" />
                <span>My Stories</span>
              </NavLink>
            )}
          </nav>
        </div>

        {/* Right side Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {user ? (
            <>
              <Link
                to="/posts/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl transition-all duration-200 shadow-glow-violet hover:-translate-y-0.5 active:translate-y-0"
              >
                <PenSquare className="w-3.5 h-3.5" />
                <span>Write Story</span>
              </Link>

              <div className="h-4 w-px bg-neutral-200 dark:bg-white/10 mx-1" />

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 py-1 px-3 rounded-full bg-neutral-100 dark:bg-white/[0.06] border border-neutral-200 dark:border-white/10">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-3 h-3" />}
                  </div>
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 max-w-[120px] truncate">
                    {user.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 rounded-xl transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl transition-all shadow-glow-violet hover:-translate-y-0.5 active:translate-y-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Get Started</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu & Theme Toggle on Mobile */}
        <div className="sm:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-xl focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-[#121215] px-4 py-4 space-y-3 animate-fade-in">
          <nav className="flex flex-col gap-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5"
            >
              <Compass className="w-4 h-4 text-violet-400" />
              Explore Feed
            </Link>
            {user && (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5"
              >
                <LayoutDashboard className="w-4 h-4 text-violet-400" />
                My Stories
              </Link>
            )}
          </nav>

          <div className="pt-3 border-t border-neutral-100 dark:border-white/[0.06] flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  to="/posts/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl shadow-glow-violet"
                >
                  <PenSquare className="w-4 h-4" />
                  Write Story
                </Link>
                <div className="flex items-center justify-between px-2 pt-2 text-xs text-neutral-500">
                  <span>Signed in as <strong className="text-neutral-900 dark:text-white">{user.name}</strong></span>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="text-rose-500 font-semibold hover:underline flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-bold text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-white/10 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl shadow-glow-violet"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
