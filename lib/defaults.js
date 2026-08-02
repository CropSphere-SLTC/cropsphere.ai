// Default content shown before Supabase is configured, or as a fallback
// when a content key has not been edited in the admin portal yet.

export const defaultContent = {
  hero: {
    title: 'Smart Farming Guidance for Sri Lankan Farmers',
    subtitle:
      'Cropsphere.ai is an AI chatbot that helps farmers plan their crops, estimate earnings, and make better decisions — in simple language, any time of day.',
    cta: 'Get Started Free',
    cta_link: '#',
  },
  about: {
    title: 'About Cropsphere',
    body: 'CropSphere is an AI-powered farming tool built to help Sri Lankan  farmers make better decisions. You can ask about what to grow, when to plant, how much you can earn, and what prices to expect at market. You\'ll get clear answers in seconds. Built by three final-year students at SLTC who care deeply about supporting rural farming communities across Sri Lanka.',
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
    title: 'Crop Yield Prediction',
    description:
      'Know how much you can harvest before you plant. Enter your soil, weather, and farming details to get a yield estimate for your district and season.',
  },
  {
    icon: '🌦️',
    title: 'Weather Forecasting',
    description:
      'See what the weather will look like in the coming weeks for your district. Plan your planting and harvesting around rain, temperature, and humidity.',
  },
  {
    icon: '💰',
    title: 'Market Price Prediction',
    description:
      'Find out what your crop will sell for at market. CropSphere tracks real price data from HARTI to show you expected farmgate and retail prices.',
  },
  {
    icon: '📊',
    title: 'Demand Forecasting',
    description:
      'See which crops are in high demand this season. Know when festivals and holidays will push prices up so you can plan your harvest around peak demand.',
  },
  {
    icon: '✅',
    title: 'Smart Crop Recommendation',
    description:
      'See which crops are in high demand this season. Know when festivals and holidays will push prices up so you can plan your harvest around peak demand.',
  },
  {
    icon: '💬',
    title: 'AI Farming Assistant',
    description:
      'Ask any farming question in plain language. CropSphere\'s chatbot uses real Sri Lankan crop data to give you accurate, grounded answers you can trust.',
  },
  {
    icon: '🕐',
    title: 'Available 24/7',
    description:
      'Ask questions any time. CropSphere never sleeps, so help is always there when you need it, whether it\'s early morning or late at night.',
  },
  {
    icon: '💬',
    title: 'AI Farming Assistant',
    description:
      'Ask any farming question in plain language. CropSphere\'s chatbot uses real Sri Lankan crop data to give you accurate, grounded answers you can trust.',
  },
  {
    icon: '🗣️',
    title: 'Simple Language',
    description:
      'Every answer is written in clear, simple words that any farmer can understand. No confusing technical terms. Just practical advice you can act on.',
  }, 
];

export const defaultSteps = [
  {
    title: 'Sign Up and Tell Us About Your Farm',
    description: 'Create a free account and select your district, season, and the crops you\'re interested in. This helps CropSphere give you answers that match your exact location and conditions.',
  },
  {
    title: 'Choose What You NeedAI Understands',
    description: 'Pick from six tools. Want to know your expected harvest? Use Yield Prediction. Wondering what price you\'ll get? Check Market Prices. Not sure what to grow? Try Crop Recommendation. Or just ask the AI Assistant anything about farming.',
  },
  {
    title: 'CropSphere Runs the Numbers',
    description: 'Behind the scenes, our AI models look at real weather data from NASA, actual market prices from HARTI, and your farm\'s details. Then they calculate the best answer for your situation.',
  },
  {
    title: 'Get Your Answer and Take Action',
    description: 'You\'ll see clear results with numbers you can trust. How many kilograms per hectare. What price to expect this week. Which crop gives you the best return. Use these answers to plan your season with confidence.',
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
    title: 'Welcome to Cropsphere.ai News',
    slug: 'welcome',
    excerpt:
      'This is a sample newsletter post. Log in to the admin portal to publish your own updates.',
    content:
      'This is a sample newsletter post. Once you connect Supabase and log in to the admin portal (/admin), you can create, edit, and publish news and newsletters that appear here automatically.',
    cover_url: '',
    created_at: new Date().toISOString(),
  },
];
