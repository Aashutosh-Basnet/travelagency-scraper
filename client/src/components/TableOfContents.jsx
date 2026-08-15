import React, { useState, useEffect } from 'react';
import { ListTree, ChevronRight } from 'lucide-react';

const TableOfContents = ({ content }) => {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');

  // Extract headings from content
  useEffect(() => {
    if (!content) {
      setHeadings([]);
      return;
    }

    const lines = content.split('\n');
    const extracted = [];
    let headingIndex = 0;

    lines.forEach((line) => {
      const h2Match = line.match(/^##\s+(.+)$/);
      const h3Match = line.match(/^###\s+(.+)$/);

      if (h2Match) {
        const text = h2Match[1].trim();
        const id = `heading-${headingIndex++}`;
        extracted.push({ id, text, level: 2 });
      } else if (h3Match) {
        const text = h3Match[1].trim();
        const id = `heading-${headingIndex++}`;
        extracted.push({ id, text, level: 3 });
      }
    });

    // Fallback: If no markdown headings found, generate top 3 sections from paragraphs
    if (extracted.length === 0) {
      const paragraphs = content
        .split('\n\n')
        .map((p) => p.trim())
        .filter((p) => p.length > 30)
        .slice(0, 4);

      paragraphs.forEach((p, idx) => {
        const title = p.substring(0, 32).trim() + '...';
        extracted.push({ id: `section-${idx}`, text: title, level: 2 });
      });
    }

    setHeadings(extracted);
    if (extracted.length > 0) {
      setActiveId(extracted[0].id);
    }
  }, [content]);

  const scrollToHeading = (id) => {
    setActiveId(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 90;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  if (headings.length === 0) return null;

  return (
    <div className="p-4 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-md">
      <div className="flex items-center gap-2 pb-3 mb-3 border-b border-neutral-200 dark:border-white/10 text-xs font-bold uppercase tracking-wider text-neutral-400">
        <ListTree className="w-3.5 h-3.5 text-violet-400" />
        <span>Table of Contents</span>
      </div>

      <nav className="space-y-1.5 text-xs">
        {headings.map((h) => {
          const isActive = activeId === h.id;
          return (
            <button
              key={h.id}
              type="button"
              onClick={() => scrollToHeading(h.id)}
              className={`group flex items-center justify-between w-full text-left py-1.5 px-2.5 rounded-lg transition-all ${
                h.level === 3 ? 'pl-5' : ''
              } ${
                isActive
                  ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 font-semibold border border-violet-500/20'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/5'
              }`}
            >
              <span className="truncate">{h.text}</span>
              <ChevronRight
                className={`w-3 h-3 flex-shrink-0 transition-transform ${
                  isActive ? 'text-violet-500 translate-x-0.5' : 'opacity-0 group-hover:opacity-100'
                }`}
              />
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default TableOfContents;
