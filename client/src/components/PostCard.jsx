import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, Share2, ArrowUpRight, Sparkles } from 'lucide-react';
import TagBadge from './TagBadge';
import { useToast } from '../context/ToastContext';

const PostCard = ({ post, onTagClick, selectedTag }) => {
  const toast = useToast();

  const handleCopyLink = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/posts/${post._id}`;
    navigator.clipboard.writeText(url);
    toast.success('Story link copied to clipboard!');
  };

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

  const readTime = calculateReadTime(post.content);

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200 dark:border-white/[0.08] bg-white/70 dark:bg-[#121215]/90 backdrop-blur-md hover:border-violet-500/40 hover:shadow-glow-violet transition-all duration-300 hover:-translate-y-1">
      <div>
        {/* Cover Image Thumbnail if available */}
        {post.coverImage ? (
          <Link to={`/posts/${post._id}`} className="block relative h-48 sm:h-52 w-full overflow-hidden bg-neutral-900/10">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-950/80 text-white backdrop-blur-md border border-white/10 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-violet-400" />
              {readTime}m read
            </span>
          </Link>
        ) : (
          <div className="h-3 bg-gradient-to-r from-violet-600/30 via-purple-600/20 to-cyan-600/30 w-full" />
        )}

        <div className="p-5 sm:p-6">
          {/* Author info & Read time */}
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
                  {post.author?.name ? post.author.name.charAt(0).toUpperCase() : <User className="w-3 h-3" />}
                </div>
                <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-[#121215]" />
              </div>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {post.author?.name || 'Anonymous Author'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span>{formatDate(post.createdAt)}</span>
              {!post.coverImage && (
                <>
                  <span>•</span>
                  <span>{readTime}m read</span>
                </>
              )}
            </div>
          </div>

          {/* Story Title */}
          <Link to={`/posts/${post._id}`} className="block group/title mb-2.5">
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-white group-hover/title:text-violet-500 dark:group-hover/title:text-violet-400 transition-colors line-clamp-2">
              {post.title}
            </h3>
          </Link>

          {/* Story Snippet */}
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed font-normal mb-4">
            {post.content}
          </p>
        </div>
      </div>

      {/* Card Footer: Tags & Actions */}
      <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-2 flex items-center justify-between gap-3 border-t border-neutral-100 dark:border-white/[0.05]">
        <div className="flex items-center gap-1.5 flex-wrap">
          {post.tags && post.tags.length > 0 ? (
            post.tags.slice(0, 2).map((tag) => (
              <TagBadge
                key={tag}
                tag={tag}
                active={selectedTag === tag}
                onClick={onTagClick ? () => onTagClick(tag) : undefined}
              />
            ))
          ) : (
            <span className="text-[11px] text-neutral-400">#story</span>
          )}
          {post.tags && post.tags.length > 2 && (
            <span className="text-[10px] font-medium text-neutral-400">+{post.tags.length - 2}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
            title="Share story link"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <Link
            to={`/posts/${post._id}`}
            className="inline-flex items-center justify-center p-1.5 text-violet-500 hover:text-violet-400 rounded-lg hover:bg-violet-500/10 transition-colors"
            title="Read story"
          >
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
