import React, { useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const ClapButton = ({ postId, initialCount = 12 }) => {
  const [claps, setClaps] = useState(initialCount);
  const [userClapped, setUserClapped] = useState(0);
  const [floaters, setFloaters] = useState([]);
  const toast = useToast();

  const handleClap = () => {
    if (userClapped >= 50) {
      toast.info('You reached the maximum 50 likes for this story!');
      return;
    }

    setClaps((prev) => prev + 1);
    setUserClapped((prev) => prev + 1);

    // Create a floating +1 particle
    const floaterId = Date.now() + Math.random();
    setFloaters((prev) => [...prev, { id: floaterId, value: `+${userClapped + 1}` }]);

    setTimeout(() => {
      setFloaters((prev) => prev.filter((f) => f.id !== floaterId));
    }, 1000);
  };

  return (
    <div className="relative inline-flex items-center">
      {/* Floating particles */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center">
        {floaters.map((f) => (
          <span
            key={f.id}
            className="text-xs font-extrabold text-violet-400 bg-violet-950/80 px-2 py-0.5 rounded-full border border-violet-500/40 shadow-glow-violet animate-bounce"
          >
            {f.value}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={handleClap}
        className={`group flex items-center gap-2.5 px-4 py-2 rounded-full border transition-all duration-200 active:scale-95 ${
          userClapped > 0
            ? 'bg-violet-500/10 border-violet-500/40 text-violet-400 shadow-glow-violet'
            : 'bg-white/5 dark:bg-white/[0.04] border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:border-violet-500/40 hover:text-violet-400'
        }`}
        title="Applaud story"
      >
        <Heart
          className={`w-4 h-4 transition-transform duration-200 group-hover:scale-125 ${
            userClapped > 0 ? 'fill-violet-500 text-violet-500' : ''
          }`}
        />
        <span className="text-xs font-bold font-mono tracking-tight">{claps}</span>
        {userClapped > 0 && (
          <span className="text-[10px] text-violet-400 font-semibold">
            ({userClapped})
          </span>
        )}
      </button>
    </div>
  );
};

export default ClapButton;
