import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md">
        <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 mx-auto mb-4 border border-neutral-200">
          <Compass className="w-6 h-6" />
        </div>
        <h1 className="text-4xl font-extrabold text-neutral-900 tracking-tight mb-2">404</h1>
        <h2 className="text-lg font-semibold text-neutral-800 mb-2">Page not found</h2>
        <p className="text-sm text-neutral-500 mb-6">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Feed</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
