import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import TagBadge from '../components/TagBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ArrowLeft,
  UploadCloud,
  X,
  Plus,
  AlertCircle,
  Save,
  Image as ImageIcon,
  CheckCircle2,
  Eye,
  PenLine,
  Heading2,
  Bold,
  Italic,
  Quote,
  List,
  Code,
  Sparkles,
} from 'lucide-react';

const SUGGESTED_TAGS = ['technology', 'react', 'webdev', 'design', 'tutorial', 'ai', 'systems', 'engineering'];

const PostEditorPage = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('published');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState('');
  const [removeCoverImage, setRemoveCoverImage] = useState(false);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState('');

  // UI state
  const [activeTab, setActiveTab] = useState('write'); // 'write' | 'preview'
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Load existing post if editing
  useEffect(() => {
    if (isEditing) {
      const loadPost = async () => {
        try {
          setInitialLoading(true);
          const data = await api.getUserPost(id);
          const post = data.post;
          setTitle(post.title || '');
          setContent(post.content || '');
          setStatus(post.status || 'published');
          setTags(post.tags || []);
          if (post.coverImage) {
            setExistingCoverUrl(post.coverImage);
            setCoverPreviewUrl(post.coverImage);
          }
        } catch (err) {
          console.error('Failed to load post for editing:', err);
          setError(err.message || 'Could not load the requested story.');
        } finally {
          setInitialLoading(false);
        }
      };
      loadPost();
    }
  }, [id, isEditing]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (coverPreviewUrl && coverPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(coverPreviewUrl);
      }
    };
  }, [coverPreviewUrl]);

  // Cover image handler
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match(/^image\/(jpeg|jpg|png|webp|gif)$/i)) {
        toast.error('Only image files (JPEG, PNG, WebP, GIF) are allowed.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image file size must be less than 5MB.');
        return;
      }

      setError('');
      setCoverFile(file);
      setRemoveCoverImage(false);
      const url = URL.createObjectURL(file);
      setCoverPreviewUrl(url);
      toast.success('Cover image attached!');
    }
  };

  const handleRemoveImage = () => {
    setCoverFile(null);
    setExistingCoverUrl('');
    setCoverPreviewUrl('');
    setRemoveCoverImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.info('Cover image removed.');
  };

  // Tag management
  const handleAddTag = (tagToAdd) => {
    const raw = typeof tagToAdd === 'string' ? tagToAdd : tagInput;
    const trimmed = raw.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (trimmed && !tags.includes(trimmed)) {
      if (tags.length >= 8) {
        toast.error('Maximum 8 tags allowed per story.');
        return;
      }
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Quick formatting insert helpers
  const insertFormatting = (prefix, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousText = textarea.value;
    const selectedText = previousText.substring(start, end);

    const replacement = `${prefix}${selectedText || 'text'}${suffix}`;
    const newContent =
      previousText.substring(0, start) + replacement + previousText.substring(end);

    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText ? selectedText.length : 4)
      );
    }, 0);
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const errors = {};

    if (!title.trim()) {
      errors.title = 'Title is required';
    } else if (title.trim().length > 200) {
      errors.title = 'Title cannot exceed 200 characters';
    }

    if (!content.trim()) {
      errors.content = 'Content is required';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error('Please fill in required fields.');
      return;
    }

    setValidationErrors({});

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      formData.append('status', status);
      formData.append('tags', JSON.stringify(tags));

      if (coverFile) {
        formData.append('coverImage', coverFile);
      } else if (removeCoverImage) {
        formData.append('removeCoverImage', 'true');
      }

      if (isEditing) {
        await api.updatePost(id, formData);
        toast.success('Story updated successfully!');
      } else {
        await api.createPost(formData);
        toast.success(status === 'published' ? 'Story published to the feed!' : 'Draft saved!');
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving post:', err);
      setError(err.message || 'Failed to save post.');
      toast.error(err.message || 'Failed to save story.');
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-28">
        <LoadingSpinner text="Preparing writer workspace..." />
      </div>
    );
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readTimeEst = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Top Bar Navigation & Actions */}
      <div className="flex items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-white/[0.08] mb-8 flex-wrap">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Status Toggle */}
          <div className="inline-flex rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/[0.04] p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setStatus('draft')}
              className={`px-3 py-1 rounded-lg transition-all ${
                status === 'draft'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs font-extrabold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Draft
            </button>
            <button
              type="button"
              onClick={() => setStatus('published')}
              className={`px-3 py-1 rounded-lg transition-all ${
                status === 'published'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs font-extrabold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Published
            </button>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl disabled:opacity-50 transition-all shadow-glow-violet active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>
              {saving
                ? 'Saving...'
                : isEditing
                ? 'Update Story'
                : status === 'published'
                ? 'Publish to Feed'
                : 'Save Draft'}
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-2.5 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Cover Image Upload Area */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
            Cover Banner <span className="text-neutral-500 font-normal lowercase">(optional)</span>
          </label>

          {coverPreviewUrl ? (
            <div className="relative rounded-3xl overflow-hidden border border-neutral-200 dark:border-white/10 bg-neutral-900 max-h-80 group shadow-2xl">
              <img
                src={coverPreviewUrl}
                alt="Cover preview"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-white text-neutral-900 rounded-xl text-xs font-bold hover:bg-neutral-100 transition-colors shadow-xs"
                >
                  Change Image
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors shadow-xs"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-neutral-300 dark:border-white/15 hover:border-violet-500 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer bg-white/50 dark:bg-white/[0.02] hover:bg-violet-500/[0.02] transition-all text-center group"
            >
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform mb-3 shadow-glow-violet">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200">
                Click or drag & drop a high-resolution cover
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">JPEG, PNG, WebP or GIF up to 5MB</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Title Input */}
        <div>
          <label
            className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2"
            htmlFor="title"
          >
            Story Title
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="An intriguing, descriptive story title..."
            className={`w-full px-5 py-3.5 text-xl sm:text-2xl font-black bg-white/70 dark:bg-[#121215]/90 border ${
              validationErrors.title ? 'border-rose-500' : 'border-neutral-200 dark:border-white/10'
            } rounded-2xl placeholder-neutral-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all text-neutral-900 dark:text-white shadow-2xs`}
          />
          {validationErrors.title && (
            <p className="text-xs text-rose-500 mt-1.5">{validationErrors.title}</p>
          )}
        </div>

        {/* Tags Section */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
            Topics & Tags <span className="text-neutral-500 font-normal lowercase">(press Enter to add)</span>
          </label>

          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              placeholder="e.g. engineering, design, ai..."
              className="w-full max-w-sm px-4 py-2 text-xs bg-white/70 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/10 rounded-xl placeholder-neutral-400 focus:outline-none focus:border-violet-500 text-neutral-900 dark:text-white"
            />
            <button
              type="button"
              onClick={() => handleAddTag()}
              className="px-3.5 py-2 text-xs font-bold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/15 rounded-xl transition-colors inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>

          {/* Suggested Tag Chips */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs text-neutral-500">
            <span className="text-[11px] font-semibold text-neutral-400">Suggestions:</span>
            {SUGGESTED_TAGS.filter((t) => !tags.includes(t))
              .slice(0, 6)
              .map((suggested) => (
                <button
                  key={suggested}
                  type="button"
                  onClick={() => handleAddTag(suggested)}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 dark:bg-white/[0.06] hover:bg-violet-500/20 text-neutral-600 dark:text-neutral-300 hover:text-violet-400 border border-neutral-200 dark:border-white/10 transition-colors"
                >
                  +{suggested}
                </button>
              ))}
          </div>

          {/* Active Tags */}
          {tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-3">
              {tags.map((tag) => (
                <TagBadge
                  key={tag}
                  tag={tag}
                  removable
                  onRemove={handleRemoveTag}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content Area with Live Dual-Pane Workspace */}
        <div>
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-neutral-200 dark:border-white/[0.08]">
            {/* Mode Switcher */}
            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-white/[0.04] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('write')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'write'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <PenLine className="w-3.5 h-3.5" />
                Write
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'preview'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Live Preview
              </button>
            </div>

            {/* Quick Formatting Insertion Toolbar */}
            {activeTab === 'write' && (
              <div className="hidden sm:flex items-center gap-1 text-neutral-400">
                <button
                  type="button"
                  onClick={() => insertFormatting('## ')}
                  className="p-1.5 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-lg"
                  title="Header 2"
                >
                  <Heading2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('**', '**')}
                  className="p-1.5 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-lg"
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('*', '*')}
                  className="p-1.5 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-lg"
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('> ')}
                  className="p-1.5 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-lg"
                  title="Quote"
                >
                  <Quote className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('```\n', '\n```')}
                  className="p-1.5 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-lg"
                  title="Code Block"
                >
                  <Code className="w-4 h-4" />
                </button>
              </div>
            )}

            <span className="text-[11px] font-bold text-neutral-400 font-mono">
              {wordCount} words • ~{readTimeEst} min read
            </span>
          </div>

          {activeTab === 'write' ? (
            <div>
              <textarea
                ref={textareaRef}
                id="content"
                rows={18}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, discoveries, or technical guide... Use markdown headers with ## for section tables."
                className={`w-full p-5 text-base sm:text-lg font-normal bg-white/70 dark:bg-[#121215]/90 border ${
                  validationErrors.content ? 'border-rose-500' : 'border-neutral-200 dark:border-white/10'
                } rounded-2xl placeholder-neutral-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all leading-relaxed font-sans text-neutral-900 dark:text-neutral-100 shadow-glass`}
              />
              {validationErrors.content && (
                <p className="text-xs text-rose-500 mt-1.5">{validationErrors.content}</p>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-3xl border border-neutral-200 dark:border-white/10 bg-white/70 dark:bg-[#121215]/80 backdrop-blur-xl min-h-[420px] shadow-glass">
              <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white mb-6">
                {title || 'Untitled Story'}
              </h2>
              {content ? (
                <div className="prose prose-neutral dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
                  {content}
                </div>
              ) : (
                <p className="text-neutral-500 italic text-sm">Nothing written yet to preview.</p>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default PostEditorPage;
