import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import TagBadge from '../components/TagBadge';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';
import ClapButton from '../components/ClapButton';
import TableOfContents from '../components/TableOfContents';
import ReadingProgressBar from '../components/ReadingProgressBar';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Edit3,
  Trash2,
  Share2,
  Check,
  BookOpen,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

const PostDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError('');

        let fetchedPost = null;
        if (user) {
          try {
            const data = await api.getUserPost(id);
            fetchedPost = data.post;
          } catch (err) {
            // Not user's post
          }
        }

        if (!fetchedPost) {
          const publicData = await api.getPublicPost(id);
          fetchedPost = publicData.post;
        }

        setPost(fetchedPost);
      } catch (err) {
        console.error('Error fetching post detail:', err);
        setError(err.message || 'Post not found or currently unavailable');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, user]);

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await api.deletePost(id);
      toast.success('Story permanently deleted');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Story link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateReadTime = (content) => {
    if (!content) return 1;
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-28">
        <LoadingSpinner text="Summoning the story..." />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 mx-auto mb-4 shadow-glow-violet">
          <BookOpen className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Story not found</h2>
        <p className="text-xs sm:text-sm text-neutral-500 mb-6">{error || 'This article may have been made private or deleted.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-glow-violet hover:from-violet-500 hover:to-indigo-500 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </Link>
      </div>
    );
  }

  const isOwner = user && post.author && (post.author._id === user._id || post.author === user._id);
  const readTime = calculateReadTime(post.content);

  return (
    <>
      {/* Sticky Glowing Scroll Progress Bar */}
      <ReadingProgressBar />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Navigation & Controls Top Bar */}
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-white/[0.08] mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explore Stories</span>
          </Link>

          <div className="flex items-center gap-2.5">
            {/* Clap Button */}
            <ClapButton postId={post._id} initialCount={18} />

            {/* Share Trigger */}
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-neutral-100 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:text-violet-500 hover:border-violet-500/40 transition-all shadow-2xs"
              title="Share story link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>

            {/* Owner Actions */}
            {isOwner && (
              <div className="flex items-center gap-1.5 border-l border-neutral-200 dark:border-white/10 pl-2.5">
                <Link
                  to={`/posts/edit/${post._id}`}
                  className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
                  title="Edit story"
                >
                  <Edit3 className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(true)}
                  className="p-2 rounded-xl text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                  title="Delete story"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Article Content */}
          <article className="lg:col-span-8">
            {/* Header */}
            <header className="mb-8">
              {isOwner && (
                <div className="mb-3">
                  <StatusBadge status={post.status} />
                </div>
              )}

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-neutral-900 dark:text-white mb-6 leading-[1.15]">
                {post.title}
              </h1>

              {/* Author & Publication metadata */}
              <div className="flex items-center justify-between gap-4 py-4 border-y border-neutral-200 dark:border-white/[0.08] flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center text-sm font-extrabold shadow-glow-violet flex-shrink-0">
                    {post.author?.name ? post.author.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      <span>{post.author?.name || 'Anonymous Author'}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        Author
                      </span>
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-2 mt-0.5">
                      <span>Published {formatDate(post.createdAt)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-violet-400 font-medium">
                        <Clock className="w-3 h-3" />
                        {readTime} min read
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Cover Image */}
            {post.coverImage && (
              <div className="mb-10 rounded-3xl overflow-hidden border border-neutral-200 dark:border-white/10 bg-neutral-900 shadow-2xl">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full max-h-[520px] object-cover"
                />
              </div>
            )}

            {/* Post Body with Rich Long-Form Typography */}
            <div className="prose prose-neutral dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-200 text-base sm:text-lg leading-relaxed whitespace-pre-wrap font-sans mb-12">
              {post.content}
            </div>

            {/* Tags Section */}
            {post.tags && post.tags.length > 0 && (
              <div className="pt-6 border-t border-neutral-200 dark:border-white/[0.08] mb-10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                  Story Topics
                </h4>
                <div className="flex items-center gap-2 flex-wrap">
                  {post.tags.map((tag) => (
                    <TagBadge key={tag} tag={tag} />
                  ))}
                </div>
              </div>
            )}

            {/* Author Profile Bio Box */}
            <div className="p-6 sm:p-8 rounded-3xl border border-neutral-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center text-lg font-black shadow-glow-violet flex-shrink-0">
                  {post.author?.name ? post.author.name.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-neutral-900 dark:text-white">
                    Written by {post.author?.name || 'Anonymous Author'}
                  </h4>
                  <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Engineering, design & editorial creator on the platform.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <ClapButton postId={post._id} initialCount={18} />
              </div>
            </div>
          </article>

          {/* Sidebar with Table of Contents & Sticky Share */}
          <aside className="hidden lg:block lg:col-span-4 space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Table of Contents widget */}
              <TableOfContents content={post.content} />

              {/* Story Details Card */}
              <div className="p-5 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.02] backdrop-blur-md space-y-3 text-xs">
                <div className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-[10px] text-neutral-400">
                  Article Info
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-white/5 text-neutral-600 dark:text-neutral-400">
                  <span>Reading Time</span>
                  <span className="font-bold text-neutral-900 dark:text-white">{readTime} minutes</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-white/5 text-neutral-600 dark:text-neutral-400">
                  <span>Word Count</span>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {post.content ? post.content.split(/\s+/).length : 0} words
                  </span>
                </div>
                <div className="flex justify-between py-1 text-neutral-600 dark:text-neutral-400">
                  <span>Published Date</span>
                  <span className="font-bold text-neutral-900 dark:text-white">{formatDate(post.createdAt)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModalOpen}
          title="Delete Story"
          message={`Are you sure you want to permanently remove "${post.title}"? This cannot be undone.`}
          confirmText="Delete Story"
          isLoading={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteModalOpen(false)}
        />
      </div>
    </>
  );
};

export default PostDetailPage;
