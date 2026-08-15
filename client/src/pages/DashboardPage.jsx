import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import TagBadge from '../components/TagBadge';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  ArrowUpDown,
  X,
  TrendingUp,
} from 'lucide-react';

const DashboardPage = () => {
  const toast = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getUserPosts({ status: statusFilter, search });
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Error fetching user posts:', err);
      setError(err.message || 'Failed to load your posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUserPosts();
    }, 200);
    return () => clearTimeout(timer);
  }, [statusFilter, search]);

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;
    try {
      setIsDeleting(true);
      await api.deletePost(postToDelete._id);
      setPosts((prev) => prev.filter((p) => p._id !== postToDelete._id));
      setDeleteModalOpen(false);
      setPostToDelete(null);
      toast.success('Story deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Metrics calculation
  const totalCount = posts.length;
  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;
  const totalWords = posts.reduce((acc, p) => acc + (p.content?.split(/\s+/).length || 0), 0);

  // Sorting
  const sortedPosts = useMemo(() => {
    const list = [...posts];
    if (sortBy === 'newest') {
      return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    if (sortBy === 'oldest') {
      return list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    if (sortBy === 'title') {
      return list.sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  }, [posts, sortBy]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-neutral-200 dark:border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 mb-2 shadow-glow-violet">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Writer's Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 dark:text-white">
            Your Stories & Analytics
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Publish drafts, manage story revisions, and review publication metrics.
          </p>
        </div>

        <Link
          to="/posts/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl transition-all shadow-glow-violet hover:-translate-y-0.5 active:translate-y-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Story</span>
        </Link>
      </div>

      {/* Analytics Summary Cards with Neon Accents */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
        <div className="p-5 rounded-2xl border border-neutral-200 dark:border-white/[0.08] bg-white/70 dark:bg-[#121215]/80 backdrop-blur-md shadow-2xs hover:border-violet-500/30 transition-colors">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Stories</span>
            <FileText className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-3xl font-black text-neutral-900 dark:text-white">{totalCount}</div>
        </div>

        <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] dark:bg-emerald-950/20 backdrop-blur-md shadow-2xs">
          <div className="flex items-center justify-between text-emerald-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Published</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-300">{publishedCount}</div>
        </div>

        <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] dark:bg-amber-950/20 backdrop-blur-md shadow-2xs">
          <div className="flex items-center justify-between text-amber-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">In Draft</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-300">{draftCount}</div>
        </div>

        <div className="p-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] dark:bg-cyan-950/20 backdrop-blur-md shadow-2xs">
          <div className="flex items-center justify-between text-cyan-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Words Written</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-cyan-600 dark:text-cyan-300">{totalWords.toLocaleString()}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-2xl border border-neutral-200 dark:border-white/[0.08] bg-white/70 dark:bg-[#121215]/80 backdrop-blur-md shadow-2xs">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-white/[0.04] p-1 rounded-xl self-start">
          <button
            type="button"
            onClick={() => setStatusFilter('')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              statusFilter === ''
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('published')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              statusFilter === 'published'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Published ({publishedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('draft')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              statusFilter === 'draft'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Drafts ({draftCount})
          </button>
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-2.5 flex-1 md:justify-end">
          <div className="relative w-full md:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your stories..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-neutral-100 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/10 rounded-xl placeholder-neutral-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-neutral-900 dark:text-white"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400 hidden sm:inline" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-neutral-100 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/10 rounded-xl py-1.5 px-2.5 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:border-violet-500 font-semibold"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stories Table */}
      <div className="mt-6">
        {loading ? (
          <LoadingSpinner text="Retrieving story archive..." />
        ) : error ? (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {error}
          </div>
        ) : sortedPosts.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={
              search || statusFilter
                ? 'No stories match your filter criteria'
                : 'No stories yet — begin your journey'
            }
            description={
              search || statusFilter
                ? 'Try resetting the search terms or status tab.'
                : 'Share your engineering solutions, design craft, or creative ideas.'
            }
            actionText="Write a Story"
            actionLink="/posts/new"
          />
        ) : (
          <div className="border border-neutral-200 dark:border-white/[0.08] rounded-2xl overflow-hidden bg-white/70 dark:bg-[#121215]/80 backdrop-blur-xl shadow-glass">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-neutral-100/50 dark:bg-white/[0.02] border-b border-neutral-200 dark:border-white/[0.08] text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6">Story</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 hidden md:table-cell">Tags</th>
                    <th className="py-3.5 px-4 hidden sm:table-cell">Created</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-white/[0.05]">
                  {sortedPosts.map((post) => (
                    <tr
                      key={post._id}
                      className="hover:bg-neutral-50/70 dark:hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Story column */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3.5">
                          {post.coverImage ? (
                            <img
                              src={post.coverImage}
                              alt=""
                              className="w-12 h-12 rounded-xl object-cover border border-neutral-200 dark:border-white/10 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/10 flex items-center justify-center text-neutral-400 flex-shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <Link
                              to={`/posts/${post._id}`}
                              className="font-bold text-neutral-900 dark:text-white hover:text-violet-500 dark:hover:text-violet-400 line-clamp-1 transition-colors"
                            >
                              {post.title}
                            </Link>
                            <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                              {post.content}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status column */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusBadge status={post.status} />
                      </td>

                      {/* Tags column */}
                      <td className="py-4 px-4 hidden md:table-cell">
                        <div className="flex items-center gap-1 flex-wrap max-w-xs">
                          {post.tags && post.tags.length > 0 ? (
                            post.tags.slice(0, 3).map((tag) => (
                              <TagBadge key={tag} tag={tag} />
                            ))
                          ) : (
                            <span className="text-xs text-neutral-400">—</span>
                          )}
                          {post.tags && post.tags.length > 3 && (
                            <span className="text-[10px] font-semibold text-neutral-400">
                              +{post.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date column */}
                      <td className="py-4 px-4 text-xs text-neutral-500 whitespace-nowrap hidden sm:table-cell">
                        {formatDate(post.createdAt)}
                      </td>

                      {/* Actions column */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/posts/${post._id}`}
                            className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                            title="View story"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/posts/edit/${post._id}`}
                            className="p-2 text-neutral-400 hover:text-violet-500 hover:bg-violet-500/10 rounded-xl transition-colors"
                            title="Edit story"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setPostToDelete(post);
                              setDeleteModalOpen(true);
                            }}
                            className="p-2 text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                            title="Delete story"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Story"
        message={`Are you sure you want to delete "${postToDelete?.title}"? This cannot be undone.`}
        confirmText="Delete Story"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalOpen(false);
          setPostToDelete(null);
        }}
      />
    </div>
  );
};

export default DashboardPage;
