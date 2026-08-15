import React from 'react';

const TagBadge = ({ tag, onClick, active = false, removable = false, onRemove }) => {
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-tight transition-all duration-150 ${
        onClick ? 'cursor-pointer' : ''
      } ${
        active
          ? 'bg-violet-500 text-white shadow-glow-violet border border-violet-400'
          : 'bg-neutral-100 dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-white/10 hover:border-violet-400/50 hover:text-violet-500 dark:hover:text-violet-300'
      }`}
    >
      <span>#{tag}</span>
      {removable && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag);
          }}
          className="ml-1 text-neutral-400 hover:text-rose-500 font-bold focus:outline-none transition-colors"
          title={`Remove tag ${tag}`}
        >
          &times;
        </button>
      )}
    </span>
  );
};

export default TagBadge;
