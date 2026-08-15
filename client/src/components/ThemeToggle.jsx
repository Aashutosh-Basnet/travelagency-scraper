import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative p-2 rounded-xl border border-white/10 dark:bg-white/5 bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 transition-all duration-200 focus:outline-none ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
    >
      <div className="relative w-4 h-4 overflow-hidden">
        <div
          className={`absolute inset-0 transform transition-transform duration-300 flex items-center justify-center ${
            isDark ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'
          }`}
        >
          <Moon className="w-4 h-4 text-violet-400" />
        </div>
        <div
          className={`absolute inset-0 transform transition-transform duration-300 flex items-center justify-center ${
            isDark ? 'rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'
          }`}
        >
          <Sun className="w-4 h-4 text-amber-500" />
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;
