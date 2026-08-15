import React, { useState } from 'react';
import { Mail, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const NewsletterBanner = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const toast = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setSubscribed(true);
    toast.success('🎉 Welcome aboard! You have subscribed to weekly stories.');
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-br from-neutral-900/90 via-violet-950/40 to-neutral-950 p-8 sm:p-12 shadow-2xl my-12">
      {/* Ambient background blur circles */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-cyan-600/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-500/10 text-violet-400 border border-violet-500/30">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>The Weekly Dispatch</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Stay ahead of modern engineering & design.
        </h3>

        <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
          Join 15,000+ creators and engineers receiving hand-curated perspectives on technology, systems, and product craft.
        </p>

        {subscribed ? (
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-sm font-semibold animate-fade-in shadow-glow-cyan">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>You're subscribed! Check your inbox for our latest edition.</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="pt-2 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-black/50 border border-white/15 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all shadow-glow-violet active:scale-95"
            >
              <span>Subscribe</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default NewsletterBanner;
