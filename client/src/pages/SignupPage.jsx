import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Lock, Mail, User, AlertCircle, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const user = await signup(name.trim(), email.trim(), password);
      toast.success(`Welcome to Editorial, ${user.name}! Your account is ready.`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to create account.');
      toast.error('Signup failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Glass Card */}
        <div className="bg-white/80 dark:bg-[#121215]/80 backdrop-blur-2xl border border-neutral-200 dark:border-white/10 rounded-3xl p-8 sm:p-9 shadow-glass space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-glow-violet">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
              Create an account
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              Join the community of engineering and design writers
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 text-xs sm:text-sm animate-fade-in">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5"
                htmlFor="name"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-neutral-100/80 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/10 rounded-xl placeholder-neutral-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5"
                htmlFor="email"
              >
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-neutral-100/80 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/10 rounded-xl placeholder-neutral-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-neutral-100/80 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/10 rounded-xl placeholder-neutral-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-neutral-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-neutral-100/80 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/10 rounded-xl placeholder-neutral-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl disabled:opacity-50 transition-all shadow-glow-violet active:scale-95"
            >
              {loading ? (
                'Creating account...'
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center text-xs text-neutral-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-violet-500 dark:text-violet-400 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
