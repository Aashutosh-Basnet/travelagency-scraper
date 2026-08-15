import React, { useState, useEffect } from 'react';

const ReadingProgressBar = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        const scrollPercentage = (totalScroll / windowHeight) * 100;
        setScrollProgress(scrollPercentage);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-neutral-900/10 dark:bg-black/40 backdrop-blur-xs">
      <div
        className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-400 shadow-glow-violet transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
};

export default ReadingProgressBar;
