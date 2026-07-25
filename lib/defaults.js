// Default content shown before Supabase is configured, or as a fallback
// when a content key has not been edited in the admin portal yet.

export const defaultContent = {
  hero: {
    title: 'Smart Farming Guidance for Sri Lankan Farmers',
    subtitle:
      'AgriBot is an AI chatbot that helps farmers plan their crops, estimate earnings, and make better decisions — in simple language, any time of day.',
    cta: 'Try AgriBot',
    cta_link: '#',
  },
  about: {
    title: 'About AgriBot',
    body: 'AgriBot is our final year project: an AI-powered chatbot built to support the farming community of Sri Lanka. Farmers can ask questions about crop planning, cultivation methods, expected income, market prices, and seasonal decisions — and get clear, practical answers instantly.',
  },
  contact: {
    email: 'tccgroup2025@gmail.com',
    phone: '+94 XX XXX XXXX',
    address: 'Sri Lanka',
  },
  // Each loading/motion feature can be switched off independently from the
  // admin portal (Site Content → Loading & Animations).
  motion: {
    splash: true, // branded sprout overlay on the first visit of a session
    progress: true, // thin green bar at the top during page navigation
    skeletons: true, // placeholder cards while content loads
    spinners: true, // small spinners inside buttons while saving/uploading
    reveal: true, // sections fade in as the visitor scrolls
  },
};

export const defaultFeatures = [
  {
    icon: '🌾',
    title: 'Crop Planning',
    description:
      'Get guidance on what to grow, when to plant, and how to prepare your land based on your region and season.',
  },
  {
    icon: '💰',
    title: 'Earnings Estimates',
    description:
      'Understand how much you can expect to earn from a crop, including cost and yield estimates.',
  },
  {
    icon: '🕐',
    title: 'Available 24/7',
    description:
      'Ask questions any time — AgriBot never sleeps, so help is always available when you need it.',
  },
  {
    icon: '🗣️',
    title: 'Simple Language',
    description:
      'Answers are written in clear, farmer-friendly language without confusing technical jargon.',
  },
];

export const defaultSteps = [
  {
    title: 'Ask a Question',
    description: 'Type your farming question — about crops, planning, costs, or earnings.',
  },
  {
    title: 'AI Understands',
    description: 'AgriBot analyses your question using AI trained on agricultural knowledge.',
  },
  {
    title: 'Get Clear Answers',
    description: 'Receive practical guidance you can act on right away.',
  },
  {
    title: 'Plan & Grow',
    description: 'Use the advice to plan your season and grow your income.',
  },
];

export const defaultTeam = [
  {
    name: 'Team Member 1',
    role: 'Team Lead / AI Developer',
    bio: 'Add your team members from the admin portal.',
    photo_url: '',
  },
  {
    name: 'Team Member 2',
    role: 'Full-Stack Developer',
    bio: 'Add your team members from the admin portal.',
    photo_url: '',
  },
];

export const defaultPosts = [
  {
    id: 'sample',
    title: 'Welcome to AgriBot News',
    slug: 'welcome',
    excerpt:
      'This is a sample newsletter post. Log in to the admin portal to publish your own updates.',
    content:
      'This is a sample newsletter post. Once you connect Supabase and log in to the admin portal (/admin), you can create, edit, and publish news and newsletters that appear here automatically.',
    cover_url: '',
    created_at: new Date().toISOString(),
  },
];
