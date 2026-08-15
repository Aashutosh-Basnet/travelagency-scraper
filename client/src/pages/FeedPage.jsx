import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PostCard from '../components/PostCard';
import SkeletonCard from '../components/SkeletonCard';
import NewsletterBanner from '../components/NewsletterBanner';
import EmptyState from '../components/EmptyState';
import {
  Search,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Flame,
  Clock,
  User,
  X,
  Compass,
} from 'lucide-react';

const FeedPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getPublicFeed({ search, tag: selectedTag });
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Error fetching feed:', err);
      setError(err.message || 'Failed to load public posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, selectedTag]);

  const calculateReadTime = (content) => {
    if (!content) return 1;
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Collect all unique tags across published posts for quick filtering bar
  const allPopularTags = useMemo(() => {
    const tagCount = {};
    posts.forEach((p) => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach((t) => {
          tagCount[t] = (tagCount[t] || 0) + 1;
        });
      }
    });
    return Object.keys(tagCount).sort((a, b) => tagCount[b] - tagCount[a]).slice(0, 10);
  }, [posts]);

  const featuredPost = !search && !selectedTag && posts.length > 0 ? posts[0] : null;
  const gridPosts = featuredPost ? posts.slice(1) : posts;

  return (
    <div className="relative min-h-screen">
      {/* Top Ambient Glow Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 ambient-mesh pointer-events-none opacity-80" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Dynamic High-Impact Hero Section */}
        <section className="text-center max-w-3xl mx-auto mb-14 space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 shadow-glow-violet backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>The Craftsman's Journal</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-neutral-900 dark:text-white leading-[1.1]">
            Where ideas transform into <span className="gradient-text">exceptional stories</span>.
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
            Thoughtfully crafted deep-dives on modern software engineering, elegant UI design, system architecture, and tech culture.
          </p>

          {/* Search bar with glowing focus */}
          <div className="pt-3 max-w-md mx-auto">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search across topics, tags, stories..."
                className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-white/80 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/10 rounded-2xl placeholder-neutral-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all backdrop-blur-md shadow-sm"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Pill Filters with Glow Active States */}
          {allPopularTags.length > 0 && (
            <div className="pt-2 flex items-center justify-center gap-1.5 flex-wrap">
              <button
                onClick={() => setSelectedTag('')}
                className={`text-xs px-3 py-1 rounded-full font-bold transition-all duration-200 ${
                  selectedTag === ''
                    ? 'bg-violet-500 text-white shadow-glow-violet border border-violet-400'
                    : 'bg-neutral-100 dark:bg-white/[0.04] text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-white/10 hover:border-violet-500/40 hover:text-violet-400'
                }`}
              >
                All Stories
              </button>
              {allPopularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                  className={`text-xs px-3 py-1 rounded-full font-bold transition-all duration-200 ${
                    selectedTag === tag
                      ? 'bg-violet-500 text-white shadow-glow-violet border border-violet-400'
                      : 'bg-neutral-100 dark:bg-white/[0.04] text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-white/10 hover:border-violet-500/40 hover:text-violet-400'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Featured Spotlight Article Banner */}
        {featuredPost && (
          <section className="mb-14">
            <div className="relative overflow-hidden rounded-3xl border border-neutral-200 dark:border-white/10 bg-white/70 dark:bg-[#121215]/80 backdrop-blur-xl hover:border-violet-500/40 hover:shadow-glow-violet transition-all duration-300 group">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                {/* Spotlight Cover */}
                {featuredPost.coverImage ? (
                  <div className="lg:col-span-6 relative h-64 sm:h-80 lg:h-auto overflow-hidden bg-neutral-900">
                    <img
                      src={featuredPost.coverImage}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:hidden" />
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-[11px] font-extrabold bg-violet-600 text-white shadow-glow-violet border border-violet-400 flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3" />
                      <span>Featured Spotlight</span>
                    </div>
                  </div>
                ) : (
                  <div className="lg:col-span-5 bg-gradient-to-br from-violet-950/80 via-neutral-900 to-black p-8 sm:p-12 flex flex-col justify-between text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-violet-500/20 blur-3xl" />
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md border border-white/20 self-start">
                      <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                      <span>Lead Story</span>
                    </div>
                    <div className="my-6">
                      <span className="text-xs uppercase tracking-widest text-violet-400 font-extrabold font-mono">
                        Exclusive Edition
                      </span>
                    </div>
                  </div>
                )}

                {/* Spotlight Details */}
                <div className={`${featuredPost.coverImage ? 'lg:col-span-6' : 'lg:col-span-7'} p-6 sm:p-10 flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mb-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
                          {featuredPost.author?.name
                            ? featuredPost.author.name.charAt(0).toUpperCase()
                            : <User className="w-3 h-3" />}
                        </div>
                        <span className="font-bold text-neutral-800 dark:text-neutral-200">
                          {featuredPost.author?.name || 'Anonymous Author'}
                        </span>
                      </div>
                      <span>•</span>
                      <span>{formatDate(featuredPost.createdAt)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-medium text-violet-500 dark:text-violet-400">
                        <Clock className="w-3.5 h-3.5" />
                        {calculateReadTime(featuredPost.content)} min read
                      </span>
                    </div>

                    <Link to={`/posts/${featuredPost._id}`} className="block group/title mb-3">
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white group-hover/title:text-violet-500 dark:group-hover/title:text-violet-400 transition-colors leading-snug">
                        {featuredPost.title}
                      </h2>
                    </Link>

                    <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed mb-6">
                      {featuredPost.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-6 border-t border-neutral-100 dark:border-white/[0.06] flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      {featuredPost.tags?.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-white/10"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    <Link
                      to={`/posts/${featuredPost._id}`}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all shadow-glow-violet active:scale-95"
                    >
                      <span>Read Story</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Multi-Column Card Grid for Stories */}
        <section>
          <div className="flex items-center justify-between gap-4 mb-6">
            <h3 className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>{selectedTag ? `Stories tagged #${selectedTag}` : search ? 'Search Results' : 'Recent Stories'}</span>
            </h3>
            <span className="text-xs font-semibold text-neutral-500 font-mono">
              {posts.length} {posts.length === 1 ? 'story' : 'stories'}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              {error}
            </div>
          ) : gridPosts.length === 0 && !featuredPost ? (
            <EmptyState
              icon={Compass}
              title="No stories found"
              description={
                search || selectedTag
                  ? 'No stories match your filter query. Try clearing your search terms or picking another tag.'
                  : 'Be the first creator to publish an inspiring story on this platform.'
              }
              actionText={user ? 'Write a Story' : 'Sign in to write'}
              actionLink={user ? '/posts/new' : '/login'}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridPosts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  selectedTag={selectedTag}
                  onTagClick={(tag) => setSelectedTag(selectedTag === tag ? '' : tag)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Sticky/Embedded Newsletter Bar */}
        <NewsletterBanner />
      </div>
    </div>
  );
};

export default FeedPage;
