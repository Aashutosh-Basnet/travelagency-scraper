import React from 'react';
import { FileText, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon = FileText,
  title = 'No posts found',
  description = 'Get started by creating your first post.',
  actionText = 'Create Post',
  actionLink = '/posts/new',
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-neutral-200 rounded-lg bg-neutral-50/50 my-6">
      <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 mb-4 border border-neutral-200">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-neutral-900 mb-1">{title}</h3>
      <p className="text-sm text-neutral-500 max-w-sm mb-6">{description}</p>
      {actionText && (
        actionLink ? (
          <Link
            to={actionLink}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {actionText}
          </Link>
        ) : (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {actionText}
          </button>
        )
      )}
    </div>
  );
};

export default EmptyState;
