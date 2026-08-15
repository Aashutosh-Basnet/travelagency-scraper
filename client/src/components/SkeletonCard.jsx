import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-[#121215] p-6 shadow-sm">
      <div className="animate-pulse space-y-4">
        {/* Author / Date row */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-white/10" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3 w-28 rounded bg-neutral-200 dark:bg-white/10" />
            <div className="h-2.5 w-16 rounded bg-neutral-200 dark:bg-white/5" />
          </div>
        </div>

        {/* Cover Skeleton */}
        <div className="h-44 w-full rounded-xl bg-neutral-200 dark:bg-white/10" />

        {/* Title */}
        <div className="h-5 w-3/4 rounded bg-neutral-200 dark:bg-white/10" />
        
        {/* Content Snippet */}
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-neutral-200 dark:bg-white/5" />
          <div className="h-3 w-5/6 rounded bg-neutral-200 dark:bg-white/5" />
        </div>

        {/* Tags Row */}
        <div className="flex gap-2 pt-2">
          <div className="h-5 w-14 rounded-full bg-neutral-200 dark:bg-white/10" />
          <div className="h-5 w-16 rounded-full bg-neutral-200 dark:bg-white/10" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
