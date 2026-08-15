const PptxGenJS = require('pptxgenjs');
const path = require('path');

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_16x9';
pptx.author = 'Antigravity';
pptx.company = 'Editorial Platform';
pptx.title = 'Editorial: Modern Full-Stack Publishing Platform';

// Color definitions
const C_BG = '09090B';
const C_CARD = '121215';
const C_VIOLET = '8B5CF6';
const C_CYAN = '06B6D4';
const C_EMERALD = '10B981';
const C_TEXT = 'F8FAFC';
const C_MUTED = '94A3B8';

// Helper for adding consistent slide background & header
function createBaseSlide(title, subtitle, tag = 'EDITORIAL PLATFORM') {
  const slide = pptx.addSlide();
  slide.background = { color: C_BG };

  // Slide Tag
  slide.addText(tag, {
    x: 0.8,
    y: 0.5,
    w: 4.0,
    h: 0.3,
    fontSize: 10,
    bold: true,
    color: C_VIOLET,
    fontFace: 'Arial',
  });

  // Slide Title
  slide.addText(title, {
    x: 0.8,
    y: 0.8,
    w: 11.5,
    h: 0.6,
    fontSize: 24,
    bold: true,
    color: C_TEXT,
    fontFace: 'Arial',
  });

  // Slide Subtitle
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.8,
      y: 1.4,
      w: 11.5,
      h: 0.4,
      fontSize: 12,
      color: C_MUTED,
      fontFace: 'Arial',
    });
  }

  // Footer
  slide.addText('Editorial — Full-Stack Blog & Publishing Platform', {
    x: 0.8,
    y: 6.8,
    w: 8.0,
    h: 0.3,
    fontSize: 9,
    color: C_MUTED,
    fontFace: 'Arial',
  });

  return slide;
}

// SLIDE 1: Title Slide
const s1 = pptx.addSlide();
s1.background = { color: C_BG };
s1.addText('FULL-STACK SYSTEM ARCHITECTURE', {
  x: 1.0,
  y: 1.8,
  w: 10.0,
  h: 0.4,
  fontSize: 12,
  bold: true,
  color: C_VIOLET,
  fontFace: 'Arial',
});
s1.addText('Editorial Platform', {
  x: 1.0,
  y: 2.3,
  w: 11.0,
  h: 1.0,
  fontSize: 38,
  bold: true,
  color: C_TEXT,
  fontFace: 'Arial',
});
s1.addText('A Dark Modern Minimalist Publishing Platform with MongoDB Session Auth, REST APIs & React Vite', {
  x: 1.0,
  y: 3.4,
  w: 10.5,
  h: 0.8,
  fontSize: 14,
  color: C_MUTED,
  fontFace: 'Arial',
});

// Title cards
s1.addShape(pptx.ShapeType.rect, { x: 1.0, y: 4.6, w: 3.4, h: 1.4, fill: { color: C_CARD }, line: { color: C_VIOLET, width: 1 } });
s1.addText('Express + MongoDB\nSession auth with MongoStore & bcrypt', { x: 1.2, y: 4.8, w: 3.0, h: 1.0, fontSize: 11, color: C_TEXT, fontFace: 'Arial' });

s1.addShape(pptx.ShapeType.rect, { x: 4.8, y: 4.6, w: 3.4, h: 1.4, fill: { color: C_CARD }, line: { color: C_CYAN, width: 1 } });
s1.addText('React 18 + Vite\nTailwind CSS, Glassmorphism & Theme Toggle', { x: 5.0, y: 4.8, w: 3.0, h: 1.0, fontSize: 11, color: C_TEXT, fontFace: 'Arial' });

s1.addShape(pptx.ShapeType.rect, { x: 8.6, y: 4.6, w: 3.4, h: 1.4, fill: { color: C_CARD }, line: { color: C_EMERALD, width: 1 } });
s1.addText('Instant Public Sharing\nZero-config ngrok & localtunnel integration', { x: 8.8, y: 4.8, w: 3.0, h: 1.0, fontSize: 11, color: C_TEXT, fontFace: 'Arial' });

// SLIDE 2: Goals & Problem Statement
const s2 = createBaseSlide('Project Goals & Problem Statement', 'Solving common architectural pitfalls in modern web publishing platforms.', 'GOALS');
s2.addShape(pptx.ShapeType.rect, { x: 0.8, y: 2.0, w: 5.5, h: 4.4, fill: { color: C_CARD }, line: { color: '334155', width: 1 } });
s2.addText('Key Challenges Addressed', { x: 1.1, y: 2.3, w: 5.0, h: 0.4, fontSize: 14, bold: true, color: 'F87171', fontFace: 'Arial' });
s2.addText('• JWT Invalidation Risks: Stateless tokens cannot be securely invalidated immediately on logout without Redis/DB blocklists.\n\n• UI Clutter & Bloat: Heavy card shadows, arbitrary gradients, and distracting elements harm reading comfort.\n\n• Author Data Leaks: Risk of exposing private drafts without strict user-level author isolation.', { x: 1.1, y: 2.8, w: 4.9, h: 3.3, fontSize: 11, color: C_TEXT, fontFace: 'Arial' });

s2.addShape(pptx.ShapeType.rect, { x: 6.8, y: 2.0, w: 5.5, h: 4.4, fill: { color: C_CARD }, line: { color: C_VIOLET, width: 1 } });
s2.addText('Core Architectural Solutions', { x: 7.1, y: 2.3, w: 5.0, h: 0.4, fontSize: 14, bold: true, color: C_EMERALD, fontFace: 'Arial' });
s2.addText('• MongoDB Persistent Sessions: Server-side express-session with connect-mongo guarantees real-time session destruction.\n\n• Dark Modern Minimalist Aesthetics: Obsidian dark canvas, neon violet accents, and Plus Jakarta Sans typography.\n\n• Rich Authoring & Reading: Live dual-pane markdown preview, floating Table of Contents, and Medium-style claps.', { x: 7.1, y: 2.8, w: 4.9, h: 3.3, fontSize: 11, color: C_TEXT, fontFace: 'Arial' });

// SLIDE 3: System Architecture
const s3 = createBaseSlide('System Architecture & Technology Stack', 'Decoupled MERN architecture with seamless reverse proxy relaying.', 'ARCHITECTURE');
s3.addShape(pptx.ShapeType.rect, { x: 0.8, y: 2.0, w: 3.6, h: 4.4, fill: { color: C_CARD }, line: { color: C_CYAN, width: 1 } });
s3.addText('1. Frontend Layer\n(Port 5173)', { x: 1.0, y: 2.3, w: 3.2, h: 0.6, fontSize: 13, bold: true, color: C_CYAN, fontFace: 'Arial' });
s3.addText('• React 18 with Vite\n• React Router DOM\n• Tailwind CSS (v3)\n• Lucide React Icons\n• AuthContext & ThemeContext\n• ToastContext System', { x: 1.0, y: 3.0, w: 3.2, h: 3.0, fontSize: 10.5, color: C_TEXT, fontFace: 'Arial' });

s3.addShape(pptx.ShapeType.rect, { x: 4.8, y: 2.0, w: 3.6, h: 4.4, fill: { color: C_CARD }, line: { color: C_VIOLET, width: 1 } });
s3.addText('2. Backend API Layer\n(Port 5000)', { x: 5.0, y: 2.3, w: 3.2, h: 0.6, fontSize: 13, bold: true, color: C_VIOLET, fontFace: 'Arial' });
s3.addText('• Node.js & Express\n• express-session (connect-mongo)\n• bcrypt (10 salt rounds)\n• Multer image file handler\n• Dynamic CORS & Trust Proxy\n• requireAuth Middleware', { x: 5.0, y: 3.0, w: 3.2, h: 3.0, fontSize: 10.5, color: C_TEXT, fontFace: 'Arial' });

s3.addShape(pptx.ShapeType.rect, { x: 8.8, y: 2.0, w: 3.6, h: 4.4, fill: { color: C_CARD }, line: { color: C_EMERALD, width: 1 } });
s3.addText('3. Database & Storage\n(MongoDB)', { x: 9.0, y: 2.3, w: 3.2, h: 0.6, fontSize: 13, bold: true, color: C_EMERALD, fontFace: 'Arial' });
s3.addText('• User collection (indexed email)\n• Post collection (compound index)\n• Sessions collection (TTL auto-purge)\n• Static /uploads file storage\n• Mongoose schemas & validation', { x: 9.0, y: 3.0, w: 3.2, h: 3.0, fontSize: 10.5, color: C_TEXT, fontFace: 'Arial' });

// SLIDE 4: Session Auth & Security
const s4 = createBaseSlide('Session Authentication & Security Deep-Dive', 'Preventing XSS and token leaks with httpOnly session cookies and bcrypt.', 'SECURITY');
s4.addShape(pptx.ShapeType.rect, { x: 0.8, y: 2.0, w: 5.5, h: 4.4, fill: { color: C_CARD }, line: { color: '334155', width: 1 } });
s4.addText('Session Security Workflow', { x: 1.1, y: 2.3, w: 5.0, h: 0.4, fontSize: 14, bold: true, color: C_TEXT, fontFace: 'Arial' });
s4.addText('1. User registers or logs in with email & password.\n2. Server salts & hashes password with bcrypt (10 rounds).\n3. Session is created in MongoDB; only req.session.userId is stored.\n4. Server responds with httpOnly, sameSite: lax cookie (connect.sid).\n5. Logout destroys session in MongoDB and erases cookie from browser.', { x: 1.1, y: 2.8, w: 4.9, h: 3.3, fontSize: 11, color: C_MUTED, fontFace: 'Arial' });

s4.addShape(pptx.ShapeType.rect, { x: 6.8, y: 2.0, w: 5.5, h: 4.4, fill: { color: C_CARD }, line: { color: C_VIOLET, width: 1 } });
s4.addText('Why Sessions Win Over JWT Here', { x: 7.1, y: 2.3, w: 5.0, h: 0.4, fontSize: 14, bold: true, color: C_VIOLET, fontFace: 'Arial' });
s4.addText('• Instant Server-Side Revocation: Banned or logged-out users lose access immediately.\n• Zero Client-Side Secret Storage: No JWT tokens stored in localStorage vulnerable to XSS.\n• Auto Expiring Sessions: MongoStore TTL automatically clears inactive session documents.\n• Sensitive Data Stripping: User passwordHash is never sent to the client.', { x: 7.1, y: 2.8, w: 4.9, h: 3.3, fontSize: 11, color: C_TEXT, fontFace: 'Arial' });

// SLIDE 5: REST API & Feed
const s5 = createBaseSlide('RESTful Post CRUD & Public Feed APIs', 'Strict user data isolation and optimized public retrieval endpoints.', 'REST API');
s5.addShape(pptx.ShapeType.rect, { x: 0.8, y: 2.0, w: 5.5, h: 4.4, fill: { color: C_CARD }, line: { color: '334155', width: 1 } });
s5.addText('Public Reader Endpoints', { x: 1.1, y: 2.3, w: 5.0, h: 0.4, fontSize: 14, bold: true, color: C_CYAN, fontFace: 'Arial' });
s5.addText('• GET /api/posts/public\n  Returns all published stories across all authors. Supports query search (?search=...) and tag filter (?tag=...).\n\n• GET /api/posts/public/:id\n  Public reader view for specific published post.\n\n• Author Population: Author name and email are populated while passwordHash is excluded.', { x: 1.1, y: 2.8, w: 4.9, h: 3.3, fontSize: 11, color: C_TEXT, fontFace: 'Arial' });

s5.addShape(pptx.ShapeType.rect, { x: 6.8, y: 2.0, w: 5.5, h: 4.4, fill: { color: C_CARD }, line: { color: C_VIOLET, width: 1 } });
s5.addText('Protected Author Endpoints (requireAuth)', { x: 7.1, y: 2.3, w: 5.0, h: 0.4, fontSize: 14, bold: true, color: C_VIOLET, fontFace: 'Arial' });
s5.addText('• GET /api/posts\n  Returns ONLY the logged-in user\'s personal posts and drafts.\n\n• POST /api/posts\n  Creates post attached to req.session.userId with Multer upload.\n\n• PUT & DELETE /api/posts/:id\n  Verifies post.author === req.session.userId. Returns 403 Forbidden for any unauthorized attempt.', { x: 7.1, y: 2.8, w: 4.9, h: 3.3, fontSize: 11, color: C_TEXT, fontFace: 'Arial' });

// SLIDE 6: UI & Design Vision
const s6 = createBaseSlide('Dark Modern Minimalist Design System', 'Obsidian dark foundations, glowing neon accents, and Plus Jakarta Sans.', 'DESIGN SYSTEM');
s6.addShape(pptx.ShapeType.rect, { x: 0.8, y: 2.0, w: 3.6, h: 4.4, fill: { color: C_CARD }, line: { color: C_VIOLET, width: 1 } });
s6.addText('Obsidian Glass Theme', { x: 1.0, y: 2.3, w: 3.2, h: 0.4, fontSize: 13, bold: true, color: C_TEXT, fontFace: 'Arial' });
s6.addText('• Deep obsidian (#09090b)\n• Frosted glassmorphism panels\n• Ambient radial mesh glows\n• Plus Jakarta Sans & Inter fonts', { x: 1.0, y: 2.8, w: 3.2, h: 3.0, fontSize: 11, color: C_MUTED, fontFace: 'Arial' });

s6.addShape(pptx.ShapeType.rect, { x: 4.8, y: 2.0, w: 3.6, h: 4.4, fill: { color: C_CARD }, line: { color: C_CYAN, width: 1 } });
s6.addText('Electric Neon Accents', { x: 5.0, y: 2.3, w: 3.2, h: 0.4, fontSize: 13, bold: true, color: C_CYAN, fontFace: 'Arial' });
s6.addText('• Electric violet & cyan highlights\n• Glowing active category pills\n• Hover card elevation & zoom\n• Shimmering skeleton loaders', { x: 5.0, y: 2.8, w: 3.2, h: 3.0, fontSize: 11, color: C_MUTED, fontFace: 'Arial' });

s6.addShape(pptx.ShapeType.rect, { x: 8.8, y: 2.0, w: 3.6, h: 4.4, fill: { color: C_CARD }, line: { color: C_EMERALD, width: 1 } });
s6.addText('Animated Theme Toggle', { x: 9.0, y: 2.3, w: 3.2, h: 0.4, fontSize: 13, bold: true, color: C_EMERALD, fontFace: 'Arial' });
s6.addText('• Seamless Dark & Light switch\n• Rotating Sun/Moon icon\n• LocalStorage persistence\n• High contrast & accessible', { x: 9.0, y: 2.8, w: 3.2, h: 3.0, fontSize: 11, color: C_MUTED, fontFace: 'Arial' });

// SLIDE 7: Key Interactive Features
const s7 = createBaseSlide('Key Interactive Features & Engagement', 'Rich micro-interactions designed to make reading and writing enjoyable.', 'FEATURES');
s7.addShape(pptx.ShapeType.rect, { x: 0.8, y: 2.0, w: 5.5, h: 4.4, fill: { color: C_CARD }, line: { color: C_VIOLET, width: 1 } });
s7.addText('Reader Experience Enhancements', { x: 1.1, y: 2.3, w: 5.0, h: 0.4, fontSize: 14, bold: true, color: C_VIOLET, fontFace: 'Arial' });
s7.addText('• Sticky Reading Progress Bar: Gradient glowing bar tracking scroll depth.\n• Dynamic Floating TOC: Parses markdown headings (##, ###) with active section tracking.\n• Medium-Style Clap Button: Emits floating +1 particle animations on applause.\n• 1-Click Share: Copy story link with animated checkmark and toast alert.', { x: 1.1, y: 2.8, w: 4.9, h: 3.3, fontSize: 11, color: C_TEXT, fontFace: 'Arial' });

s7.addShape(pptx.ShapeType.rect, { x: 6.8, y: 2.0, w: 5.5, h: 4.4, fill: { color: C_CARD }, line: { color: C_CYAN, width: 1 } });
s7.addText('Writer Experience Enhancements', { x: 7.1, y: 2.3, w: 5.0, h: 0.4, fontSize: 14, bold: true, color: C_CYAN, fontFace: 'Arial' });
s7.addText('• Dual-Pane Markdown Preview: Write vs Live Preview tabs.\n• Drag & Drop Cover Banner: Instant photo preview, replace, and removal.\n• Studio Analytics Cards: Total stories, published, drafts, and words written.\n• Tag Suggestion Chips: Quick-add popular topics with one click.', { x: 7.1, y: 2.8, w: 4.9, h: 3.3, fontSize: 11, color: C_TEXT, fontFace: 'Arial' });

// SLIDE 8: Sharing with ngrok & localtunnel
const s8 = createBaseSlide('Public Sharing with ngrok & localtunnel', 'Zero-config tunnel architecture with same-origin cookie protection.', 'SHARING');
s8.addShape(pptx.ShapeType.rect, { x: 0.8, y: 2.0, w: 5.5, h: 4.4, fill: { color: C_CARD }, line: { color: '334155', width: 1 } });
s8.addText('Why Single-Port Tunneling Works', { x: 1.1, y: 2.3, w: 5.0, h: 0.4, fontSize: 14, bold: true, color: C_EMERALD, fontFace: 'Arial' });
s8.addText('• Vite Reverse Proxy: Only port 5173 is exposed. Vite relays /api and /uploads to Express on port 5000.\n• Same-Origin Cookie Security: Browsers send session cookies because client and API share the tunnel domain.\n• Express Trust Proxy: app.set("trust proxy", 1) guarantees HTTPS headers are recognized over tunnels.', { x: 1.1, y: 2.8, w: 4.9, h: 3.3, fontSize: 11, color: C_TEXT, fontFace: 'Arial' });

s8.addShape(pptx.ShapeType.rect, { x: 6.8, y: 2.0, w: 5.5, h: 4.4, fill: { color: C_CARD }, line: { color: C_VIOLET, width: 1 } });
s8.addText('Instant 1-Click Launch Scripts', { x: 7.1, y: 2.3, w: 5.0, h: 0.4, fontSize: 14, bold: true, color: C_VIOLET, fontFace: 'Arial' });
s8.addText('1. Option A (localtunnel — Zero setup):\n   npm run share  (or double-click start-tunnel.bat)\n\n2. Option B (Official ngrok):\n   ngrok http 5173\n\nFriends can browse, register, write stories, and give claps in real-time!', { x: 7.1, y: 2.8, w: 4.9, h: 3.3, fontSize: 11, color: C_MUTED, fontFace: 'Arial' });

// SLIDE 9: Testing & Verification
const s9 = createBaseSlide('Automated Testing & Security Matrix', 'Complete end-to-end verification of authentication barriers and data isolation.', 'TESTING');
s9.addShape(pptx.ShapeType.rect, { x: 0.8, y: 2.0, w: 11.5, h: 4.4, fill: { color: C_CARD }, line: { color: C_EMERALD, width: 1 } });
s9.addText('Automated Test Suite (server/test_backend.js)', { x: 1.1, y: 2.3, w: 10.0, h: 0.4, fontSize: 14, bold: true, color: C_EMERALD, fontFace: 'Arial' });
s9.addText('✓ Test 1: Server Health Check returns 200 OK.\n✓ Test 2: User signup hashes password with bcrypt; passwordHash is never exposed in response.\n✓ Test 3: Session persistence verified via GET /api/auth/me.\n✓ Test 4: Post creation with tags and published status.\n✓ Test 5: Draft post creation and private visibility.\n✓ Test 6 & 7: User isolation check: User B cannot see User A\'s private drafts.\n✓ Test 8: Security barrier: User B attempting to edit or delete User A\'s post returns 403 Forbidden.\n✓ Test 9: Public feed filtering returns published stories only.\n✓ Test 10 & 11: Owner update and deletion.\n✓ Test 12: Logout destroys session in MongoDB; subsequent requests return 401 Unauthorized.', { x: 1.1, y: 2.8, w: 10.8, h: 3.3, fontSize: 10.5, color: C_TEXT, fontFace: 'Arial' });

// SLIDE 10: Conclusion
const s10 = createBaseSlide('Summary & Conclusion', 'A scalable, production-ready, beautifully designed editorial platform.', 'CONCLUSION');
s10.addShape(pptx.ShapeType.rect, { x: 0.8, y: 2.0, w: 3.6, h: 4.4, fill: { color: C_CARD }, line: { color: C_VIOLET, width: 1 } });
s10.addText('Production-Grade Auth', { x: 1.0, y: 2.3, w: 3.2, h: 0.4, fontSize: 13, bold: true, color: C_VIOLET, fontFace: 'Arial' });
s10.addText('• Server-side MongoDB sessions\n• bcrypt password hashing\n• Strict author ownership checks\n• Automated E2E test suite', { x: 1.0, y: 2.8, w: 3.2, h: 3.0, fontSize: 11, color: C_MUTED, fontFace: 'Arial' });

s10.addShape(pptx.ShapeType.rect, { x: 4.8, y: 2.0, w: 3.6, h: 4.4, fill: { color: C_CARD }, line: { color: C_CYAN, width: 1 } });
s10.addText('Refined Visual Craft', { x: 5.0, y: 2.3, w: 3.2, h: 0.4, fontSize: 13, bold: true, color: C_CYAN, fontFace: 'Arial' });
s10.addText('• Dark modern minimalist design\n• Animated theme toggle\n• Live dual-pane editor preview\n• Floating TOC & progress bar', { x: 5.0, y: 2.8, w: 3.2, h: 3.0, fontSize: 11, color: C_MUTED, fontFace: 'Arial' });

s10.addShape(pptx.ShapeType.rect, { x: 8.8, y: 2.0, w: 3.6, h: 4.4, fill: { color: C_CARD }, line: { color: C_EMERALD, width: 1 } });
s10.addText('Publicly Shareable', { x: 9.0, y: 2.3, w: 3.2, h: 0.4, fontSize: 13, bold: true, color: C_EMERALD, fontFace: 'Arial' });
s10.addText('• 1-click ngrok & localtunnel\n• Zero-config friend sharing\n• Full documentation guides\n• Interactive presentation deck', { x: 9.0, y: 2.8, w: 3.2, h: 3.0, fontSize: 11, color: C_MUTED, fontFace: 'Arial' });

// Output file path
const outputPath = path.join(__dirname, '..', 'Editorial_Platform_Presentation.pptx');

pptx.writeFile({ fileName: outputPath })
  .then((fileName) => {
    console.log(`✅ PowerPoint presentation successfully generated at: ${fileName}`);
  })
  .catch((err) => {
    console.error('Error generating PPTX:', err);
  });
