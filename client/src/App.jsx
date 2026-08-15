import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import FeedPage from './pages/FeedPage';
import DashboardPage from './pages/DashboardPage';
import PostDetailPage from './pages/PostDetailPage';
import PostEditorPage from './pages/PostEditorPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import NotFoundPage from './pages/NotFoundPage';
import { Sparkles } from 'lucide-react';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-[#09090b] text-neutral-900 dark:text-neutral-100 font-sans selection:bg-violet-600 selection:text-white transition-colors duration-200">
              <Navbar />

              <main className="flex-1">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<FeedPage />} />
                  <Route path="/feed" element={<FeedPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/posts/:id" element={<PostDetailPage />} />

                  {/* Protected Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/posts/new"
                    element={
                      <ProtectedRoute>
                        <PostEditorPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/posts/edit/:id"
                    element={
                      <ProtectedRoute>
                        <PostEditorPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>

              {/* Sleek Dark Modern Minimalist Footer */}
              <footer className="border-t border-neutral-200 dark:border-white/[0.08] bg-white/50 dark:bg-[#09090b]/80 backdrop-blur-xl py-12 mt-20 text-xs text-neutral-500">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-glow-violet">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-extrabold text-neutral-900 dark:text-white text-sm">Editorial</span>
                    <span className="text-neutral-400 dark:text-neutral-500">— Modern Dark Minimalist Publishing Platform</span>
                  </div>
                  <div className="flex items-center gap-6 font-semibold">
                    <Link to="/" className="hover:text-violet-500 dark:hover:text-violet-400 transition-colors">
                      Feed
                    </Link>
                    <Link to="/dashboard" className="hover:text-violet-500 dark:hover:text-violet-400 transition-colors">
                      My Stories
                    </Link>
                    <span className="text-neutral-400 dark:text-neutral-600">
                      © {new Date().getFullYear()} Editorial. All rights reserved.
                    </span>
                  </div>
                </div>
              </footer>
            </div>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
