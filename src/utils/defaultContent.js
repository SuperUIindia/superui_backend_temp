/**
 * Heading block rendered above the services grid (stored in the database)
 */
const DEFAULT_SERVICES_HEADER = {
  badge: 'Our Capabilities',
  heading: 'Tailored services for',
  highlight: 'ambitious teams',
  subtext:
    'Select a service below to get an instant scope review and fixed-rate proposal for your project in under a minute.'
};

/**
 * Default content specifications seeded into MongoDB SiteContent
 */
const DEFAULT_SERVICES = [
  {
    key: 'website-development',
    title: 'Website Development',
    shortTitle: 'Web Development',
    description: 'High-speed, responsive websites for every business model, from brochure sites to complex web applications and PWAs.',
    icon: 'Globe',
    badge: 'Core',
    items: [
      'Business website development',
      'Corporate website',
      'Portfolio website',
      'Landing page development',
      'Personal website',
      'Blog website',
      'News/magazine website',
      'Booking website',
      'Membership website',
      'Directory/listing website',
      'Custom web applications',
      'Progressive Web Apps (PWA)'
    ]
  },
  {
    key: 'ecommerce-development',
    title: 'E-commerce Development',
    shortTitle: 'E-commerce',
    description: 'Conversion-focused storefronts with friction-free checkout, catalog management and multi-vendor capability.',
    icon: 'ShoppingBag',
    badge: 'Popular',
    items: [
      'E-commerce website',
      'Online store development',
      'Custom shopping website',
      'Product catalog website',
      'Multi-vendor marketplace',
      'Digital-product store',
      'Subscription website',
      'Payment gateway integration',
      'Shopping cart & checkout',
      'Order management system',
      'Inventory management',
      'Coupon/discount systems'
    ]
  },
  {
    key: 'admin-business-systems',
    title: 'Admin & Business Systems',
    shortTitle: 'Business Systems',
    description: 'Bespoke admin panels, CRMs and operational dashboards with live metrics, permissions and data filters.',
    icon: 'LayoutDashboard',
    badge: 'Enterprise',
    items: [
      'Admin dashboard development',
      'Custom admin panel',
      'CRM development',
      'Customer management system',
      'Order management',
      'Invoice management',
      'Employee management',
      'Inventory dashboard',
      'Analytics dashboard',
      'Booking management',
      'Customer support dashboard',
      'Internal business tools'
    ]
  },
  {
    key: 'ui-ux-design',
    title: 'UI/UX & Design',
    shortTitle: 'UI/UX Design',
    description: 'Intuitive user flows, wireframes and pixel-perfect design systems crafted around real user behaviour.',
    icon: 'Palette',
    badge: 'Creative',
    items: [
      'Website UI design',
      'SaaS UI design',
      'Dashboard UI',
      'Mobile UI',
      'Landing page design',
      'E-commerce UI',
      'Design systems',
      'UI component libraries',
      'Figma design',
      'UX research',
      'Wireframes',
      'Prototypes',
      'Website redesign'
    ]
  },
  {
    key: 'react-frontend-development',
    title: 'React & Frontend Development',
    shortTitle: 'React & Frontend',
    description: 'Blazing-fast React and Next.js applications with clean component architecture and API integration.',
    icon: 'Code2',
    badge: 'Tech Stack',
    items: [
      'React.js development',
      'Next.js development',
      'Responsive frontend',
      'React dashboard',
      'React component development',
      'SaaS frontend',
      'API integration',
      'Authentication UI',
      'Payment UI',
      'Performance optimization',
      'Frontend bug fixing'
    ]
  },
  {
    key: 'backend-api-development',
    title: 'Backend & API Development',
    shortTitle: 'Backend & APIs',
    description: 'Robust Node.js and Express backends with secure auth, RBAC, webhooks and third-party API integration.',
    icon: 'Server',
    badge: 'APIs',
    items: [
      'Node.js development',
      'Express.js APIs',
      'REST API development',
      'Authentication systems',
      'Authorization/RBAC',
      'Database integration',
      'Third-party API integration',
      'Webhooks',
      'Payment APIs',
      'Email APIs',
      'File-storage systems',
      'Backend optimization'
    ]
  },
  {
    key: 'website-maintenance',
    title: 'Website Maintenance',
    shortTitle: 'Maintenance',
    description: 'Recurring monthly care covering security updates, backups, uptime monitoring and proactive optimisation.',
    icon: 'Wrench',
    badge: 'Recurring',
    items: [
      'Website maintenance',
      'Security updates',
      'Bug fixing',
      'Content updates',
      'Product updates',
      'Backup management',
      'Performance optimization',
      'Database maintenance',
      'SSL/domain assistance',
      'Hosting management',
      'Broken-page fixing',
      'Mobile responsiveness fixes',
      'Monthly maintenance plans'
    ]
  },
  {
    key: 'security-services',
    title: 'Security Services',
    shortTitle: 'Security',
    description: 'Hardened applications with MFA, role-based access control, rate limiting, CAPTCHA and security headers.',
    icon: 'ShieldCheck',
    badge: 'Protection',
    items: [
      'Website security audit',
      'Authentication implementation',
      'MFA/TOTP integration',
      'Role-based access control',
      'API security',
      'Secure file downloads',
      'Payment security integration',
      'Rate limiting',
      'CAPTCHA/anti-spam',
      'Security headers',
      'Backup strategy',
      'Vulnerability review'
    ]
  },
  {
    key: 'cloud-deployment',
    title: 'Cloud & Deployment',
    shortTitle: 'Cloud & DevOps',
    description: 'Zero-downtime releases across Vercel, Render, VPS and Cloudflare with CI/CD pipelines built in.',
    icon: 'Cloud',
    badge: 'Infrastructure',
    items: [
      'Vercel deployment',
      'Cloudflare configuration',
      'VPS deployment',
      'Node.js deployment',
      'Database deployment',
      'Domain configuration',
      'DNS configuration',
      'SSL setup',
      'CDN configuration',
      'Cloud storage',
      'Object storage integration',
      'Production environment setup',
      'CI/CD setup'
    ]
  },
  {
    key: 'digital-products',
    title: 'Digital Products',
    shortTitle: 'Digital Products',
    description: 'Reusable, commercial-ready assets you can own outright: components, templates, kits and boilerplate.',
    icon: 'Package',
    badge: 'Scalable',
    items: [
      'React UI components',
      'HTML/CSS templates',
      'SaaS templates',
      'Dashboard templates',
      'Landing-page templates',
      'Portfolio templates',
      'E-commerce templates',
      'Figma UI kits',
      'Design systems',
      'Icons',
      'Illustrations',
      'Website templates',
      'Admin templates',
      'Code snippets',
      'Starter projects',
      'Boilerplates',
      'Developer resources'
    ]
  },
  {
    key: 'ebooks-educational-products',
    title: 'Ebooks & Educational Products',
    shortTitle: 'Ebooks & Courses',
    description: 'Practical, project-based learning material covering ebooks, guides, cheat sheets and video mini-courses.',
    icon: 'BookOpen',
    badge: 'Education',
    items: [
      'Web development ebooks',
      'React ebooks',
      'JavaScript ebooks',
      'UI/UX ebooks',
      'CSS ebooks',
      'Design-system guides',
      'SEO guides',
      'Freelancing guides',
      'Business/technology guides',
      'Programming cheat sheets',
      'PDF guides',
      'Coding resources',
      'Video courses',
      'Mini courses',
      'Developer checklists'
    ]
  },
  {
    key: 'seo-digital-marketing',
    title: 'SEO & Digital Marketing',
    shortTitle: 'SEO & Marketing',
    description: 'Technical and on-page SEO plus analytics, pixel and social setups so every visit is measurable.',
    icon: 'TrendingUp',
    badge: 'Growth',
    items: [
      'SEO setup',
      'Technical SEO',
      'On-page SEO',
      'Website SEO audit',
      'Keyword research',
      'Search Console setup',
      'Google Analytics setup',
      'Meta Pixel setup',
      'Conversion tracking',
      'Landing-page optimization',
      'Social-media setup',
      'Social-media creatives',
      'Paid-ad landing pages'
    ]
  },
  {
    key: 'automation',
    title: 'Automation',
    shortTitle: 'Automation',
    description: 'Connected workflows that remove manual work across CRM, email, invoicing, orders and reporting.',
    icon: 'Cpu',
    badge: 'Efficiency',
    items: [
      'Business automation',
      'Email automation',
      'Lead management',
      'Form-to-email automation',
      'Invoice automation',
      'Order automation',
      'Telegram notifications',
      'WhatsApp integrations',
      'CRM automation',
      'Webhook automation',
      'Scheduled reports',
      'Excel/Google Sheets automation',
      'API automation'
    ]
  },
  {
    key: 'payment-digital-delivery',
    title: 'Payment & Digital Delivery',
    shortTitle: 'Payments & Delivery',
    description: 'Razorpay and Stripe checkout, webhook handling, invoicing and secure time-limited digital delivery.',
    icon: 'CreditCard',
    badge: 'Fintech',
    items: [
      'Razorpay integration',
      'Stripe integration',
      'Payment gateway setup',
      'Payment webhook integration',
      'Order processing',
      'Digital product delivery',
      'Secure download links',
      'Temporary download URLs',
      'Invoice generation',
      'Email delivery',
      'Payment-failure handling',
      'Refund workflow'
    ]
  },
  {
    key: 'hosting-domain-services',
    title: 'Hosting & Domain Services',
    shortTitle: 'Hosting & Domain',
    description: 'Domain, DNS, hosting, CDN and migration handled end to end, with monitoring and backup configuration.',
    icon: 'Network',
    badge: 'Infrastructure',
    items: [
      'Domain setup',
      'DNS configuration',
      'Cloudflare setup',
      'Hosting setup',
      'VPS setup',
      'Website migration',
      'SSL setup',
      'Email-domain setup',
      'CDN configuration',
      'Server monitoring',
      'Backup configuration'
    ]
  }
];

const DEFAULT_HERO = {
  anchorId: 'top',
  pillText: 'Full-Stack Digital Product Engineering',
  headline: 'We build fast, secure websites that grow your business.',
  headlineHighlightFrom: 4,
  subtext:
    'From high-converting web apps and performant dashboards to custom automations—SuperUI delivers production-ready engineering designed for measurable business growth.',
  primaryCtaText: 'Start a Project',
  secondaryCtaText: 'View Services',
  trustPoints: ['Production-ready code', 'Secure by default', 'Fast 24h turnaround']
};

/**
 * Navbar: brand, links and CTA labels. Every link is an in-page anchor.
 */
const DEFAULT_NAVBAR = {
  brandName: 'SuperUI',
  brandHighlight: '',
  logoUrl: '/superui_logo.png',
  homeHref: '#top',
  links: [
    { label: 'Home', href: '#top' },
    { label: 'Services', href: '#services' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Why SuperUI', href: '#why-us' },
    { label: 'Contact', href: '#contact' }
  ],
  ctaLabel: 'Start a Project',
  ctaLabelMobile: 'Start Project'
};

/**
 * Marquee: two rows of scrolling capability chips. Each row is duplicated in the
 * DOM for the seamless loop, so only the unique strings are stored.
 */
const DEFAULT_MARQUEE = {
  rows: [
    [
      { text: 'Website Development', highlight: true },
      { text: 'React 19 & Next.js', highlight: false },
      { text: 'E-commerce Platforms', highlight: true },
      { text: 'Tailwind CSS & Framer Motion', highlight: false },
      { text: 'Admin Dashboards', highlight: true },
      { text: 'Payment Gateway Integration', highlight: false },
      { text: 'High-Converting Landing Pages', highlight: false },
      { text: 'Modern REST & GraphQL APIs', highlight: false }
    ],
    [
      { text: 'UI/UX Design & Prototyping', highlight: true },
      { text: 'Business Workflow Automation', highlight: true },
      { text: 'MongoDB & Cloud Architecture', highlight: false },
      { text: 'Core Web Vitals & SEO', highlight: true },
      { text: 'Zero-Downtime Maintenance', highlight: false },
      { text: 'Mobile-First Responsive Design', highlight: false },
      { text: 'Custom SaaS Web Applications', highlight: true },
      { text: 'Speed & Security Hardening', highlight: false }
    ]
  ]
};

/**
 * Why Us: four trust cards. `icon` must be one of the keys in ServiceCard's
 * ICON_MAP (Globe, Code, ShieldCheck, Zap, HeartHandshake, ...).
 */
const DEFAULT_WHY_US = {
  anchorId: 'why-us',
  badge: 'Why Choose Us',
  sectionTitle: 'Built with precision, engineered for',
  sectionHighlight: 'growth',
  sectionSubtitle:
    'We partner with founders and enterprises to ship digital products that convert, scale, and endure.',
  cardFooter: 'Included in every engagement',
  points: [
    {
      title: 'Production-Ready Code',
      description:
        'Clean, documented, maintainable code written to modern industry standards. No shortcuts, no spaghetti.',
      icon: 'Code',
      badge: 'Architecture',
      accent: '#FF5E00'
    },
    {
      title: 'Secure by Default',
      description:
        'OWASP-compliant best practices, rate limiting, hashed sensitive data, and encrypted transport built-in.',
      icon: 'ShieldCheck',
      badge: 'Security',
      accent: '#7C3AED'
    },
    {
      title: 'High Velocity Delivery',
      description:
        'Streamlined agile workflow that turns requirements into shipped products in days, not quarters.',
      icon: 'Zap',
      badge: 'Speed',
      accent: '#FF5E00'
    },
    {
      title: 'Continuous Maintenance',
      description:
        'Post-launch monitoring, performance tuning, and guaranteed SLA support so your product never goes down.',
      icon: 'HeartHandshake',
      badge: 'Reliability',
      accent: '#7C3AED'
    }
  ]
};

/**
 * How It Works: the four-step engagement lifecycle.
 */
const DEFAULT_HOW_IT_WORKS = {
  anchorId: 'how-it-works',
  badge: 'Simple 4-Step Process',
  sectionTitle: 'How we turn ideas into',
  sectionHighlight: 'reality',
  sectionSubtitle:
    'Transparent, reliable engineering from the first consultation through release day and beyond.',
  steps: [
    {
      num: '01',
      title: 'Tell Us Your Needs',
      description:
        'Fill out our 1-minute form with your goals, target audience, and feature wish-list.',
      icon: 'MessageSquareText',
      color: '#FF5E00'
    },
    {
      num: '02',
      title: 'Scope & Proposal',
      description:
        'Receive a transparent, fixed-price quote with milestones, timeline, and tech specs.',
      icon: 'FileSpreadsheet',
      color: '#7C3AED'
    },
    {
      num: '03',
      title: 'Agile Build & Feedback',
      description:
        'We code with modern stacks, delivering sprint previews and weekly milestone updates.',
      icon: 'Code2',
      color: '#FF5E00'
    },
    {
      num: '04',
      title: 'Launch & Support',
      description:
        'Thorough QA, cloud deployment, asset handover, and continuous maintenance warranty.',
      icon: 'Rocket',
      color: '#7C3AED'
    }
  ]
};

/**
 * Contact section: heading, the three contact points and the guarantee list.
 */
const DEFAULT_CONTACT = {
  anchorId: 'contact',
  badge: 'Get In Touch',
  sectionTitle: "Let's discuss your next",
  sectionHighlight: 'breakthrough',
  sectionSubtitle:
    'Whether you need a new website, a full product redesign, or ongoing technical support, share your project requirements below.',
  points: [
    { label: 'Direct Email', value: 'hello.superui@gmail.com', href: 'mailto:hello.superui@gmail.com' },
    { label: 'Response SLA', value: 'Within 24 business hours' },
    { label: 'Location', value: 'Warangal, Telangana, India (Serving Global Clients)' }
  ],
  guarantees: [
    'Free architecture & technical consultation',
    'Fixed upfront quote with zero hidden charges',
    'NDA signed upon request for confidential ideas'
  ],
  // The inquiry form renders inline in the right-hand card of this section.
  // These three strings head that form.
  formCardTitle: 'Project Inquiry Form',
  formCardSubtitle:
    'Fill out the parameters below and our engineering team will get back to you with a roadmap.',
  formCardButton: 'Open the contact form'
};

/**
 * Bottom call-to-action band.
 */
const DEFAULT_CTA_BAND = {
  badge: 'Ready to kickstart?',
  heading: "Let's turn your vision into a live product.",
  subtext:
    "Send your requirements today. We'll examine your architecture, recommend the best tech stack, and share a fixed-price proposal.",
  ctaText: 'Start a Project'
};

/**
 * Footer: brand, link groups, contact details and legal lines.
 * The Services group is populated from the services catalogue at render time,
 * so `servicesLimit` controls how many categories are listed.
 */
const DEFAULT_FOOTER = {
  brandName: 'SuperUI',
  brandHighlight: '',
  logoUrl: '/superui_logo.png',
  tagline:
    'Full-stack digital engineering studio building performant, conversion-driven websites and scalable web applications for forward-thinking businesses.',
  servicesGroupTitle: 'Services',
  servicesLimit: 6,
  companyGroupTitle: 'Company',
  companyLinks: [
    { label: 'Home', href: '#top' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Why SuperUI', href: '#why-us' },
    { label: 'Start Inquiry', href: '#contact' }
  ],
  contactGroupTitle: 'Contact',
  contactItems: [
    { label: 'hello.superui@gmail.com', href: 'mailto:hello.superui@gmail.com' },
    { label: 'Response in under 24 hours' },
    { label: 'Warangal, Telangana, India (Global Remote)' }
  ],
  copyrightText: 'SuperUI. All rights reserved.',
  privacyNote:
    'Privacy Note: We respect your privacy. Visitor metrics are anonymized with SHA-256 and never shared.',
  backToTopLabel: 'Back to top'
};

/**
 * Contact modal copy (the modal opened from any CTA).
 */
const DEFAULT_CONTACT_MODAL = {
  badge: 'Start Your Project',
  heading: "Let's build something",
  headingHighlight: 'exceptional',
  subtext:
    "Tell us about your requirements. We'll review your project scope and follow up with a proposal within 24 hours."
};

/**
 * Contact form field labels, placeholders and messaging.
 */
const DEFAULT_CONTACT_FORM = {
  fields: {
    name: { label: 'Your Name', placeholder: 'John Doe' },
    email: { label: 'Email Address', placeholder: 'john@company.com' },
    phone: { label: 'Phone / WhatsApp', placeholder: '+91 98765 43210' },
    instagram: { label: 'Instagram ID', placeholder: '@yourhandle' },
    purpose: { label: 'Purpose', placeholder: 'Select a service' },
    description: {
      label: 'Reason / Note',
      placeholder:
        'Briefly tell us what you need built, your goals, target audience, or any reference websites...'
    }
  },
  optionalSuffix: '(Optional)',
  honeypotLabel: 'Leave this empty',
  submitText: 'Send Project Requirements',
  footnote: 'No spam guaranteed. We respond with a tailored proposal in <24 hours.',
  successHeadingPrefix: 'Thank you dear',
  successFallbackName: 'there',
  // Shown in the popup that confirms a submission, above the reply copy.
  successTagline: 'We build fast, secure websites that grow your business.',
  successBody:
    'We have received your requirements and we will contact you soon. Our team usually replies within 24 business hours.',
  successFasterReply: 'Want a faster reply?',
  successDmCta: 'Message me on Instagram',
  successFollowCta: 'Follow SuperUI on Instagram',
  successSubmitAnother: 'Submit Another Request',
  successClose: 'Continue',
  errorFallbackEmail: 'hello.superui@gmail.com'
};

/**
 * Document head metadata (title, description, keywords, Open Graph, Twitter).
 *
 * These are the DB-driven defaults an admin can edit from
 * Admin -> All Sections -> SEO. index.html carries the identical pre-render
 * copy for crawlers that never execute JavaScript, and
 * frontend/src/lib/seo.js applies whichever is newer at runtime.
 */
const DEFAULT_SEO = {
  title: 'SuperUI — Web Development, UI/UX Design & Custom Software Studio',
  description:
    'SuperUI is a full-stack web development and UI/UX design studio in Warangal, Telangana, India. We build fast, secure, SEO-optimised websites, e-commerce stores and custom web applications. Get a fixed-price proposal within 24 hours.',
  keywords:
    'web development company Warangal, UI UX design services India, custom web application development, ecommerce website development, React Next.js developers India, website maintenance SEO services, admin dashboard development, SuperUI, SuperUI Warangal',
  author: 'SuperUI',
  robots: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
  ogType: 'website',
  siteUrl: 'https://superui.in/',
  ogSiteName: 'SuperUI',
  ogLocale: 'en_IN',
  ogTitle: 'SuperUI — Web Development, UI/UX Design & Custom Software Studio',
  ogDescription:
    'A full-stack engineering and design studio in Warangal, Telangana delivering high-speed web apps, e-commerce stores, custom software and conversion-optimised websites.',
  ogImage: 'https://superui.in/superui_logo.png',
  ogImageAlt: 'SuperUI logo',
  twitterCard: 'summary_large_image'
};

const DEFAULT_FEATURED_PRODUCTS = {
  badge: 'Curated Digital Marketplace',
  title: 'Explore Featured Collections & Digital Assets',
  subtitle:
    'Choose a collection below to browse ready-to-download e-books, templates, UI components, and creative systems.',
  products: [
    {
      id: 'ebooks',
      name: 'All Types of E-Books',
      href: '/ebooks-digital',
      buttonLabel: 'E-Books',
      image: '/E_Books.png',
      imageAlt: 'All Types of E-Books - Devotional, Fitness, Recipes, Marketing Guides',
      bgColor: 'bg-[#F5F3FF]',
      accentColor: '#7C3AED'
    },
    {
      id: 'digital-products',
      name: 'UI Kits & Digital Assets',
      href: '/digital-products',
      buttonLabel: 'Websites',
      image:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=85',
      imageAlt: 'Digital UI Kits and Web Development Systems',
      bgColor: 'bg-[#EFF6FF]',
      accentColor: '#FF5E00'
    }
  ]
};

const DEFAULT_SERVICES_SECTION = {
  header: DEFAULT_SERVICES_HEADER,
  categories: DEFAULT_SERVICES
};

/**
 * Every editable section of the public site. Adding a key here is what makes the
 * section appear in the admin "All Sections" list and in GET /api/content.
 * Keys are lowercased by the SiteContent model, so `howItWorks` -> `howitworks`.
 */
const DEFAULT_SECTIONS = {
  navbar: {
    title: 'Navbar & Navigation',
    description: 'Brand name, logo, navigation links and the header CTA labels',
    data: DEFAULT_NAVBAR
  },
  hero: {
    title: 'Hero Headline & Ambient Taglines',
    description: 'Main homepage introductory messaging and value proposition',
    data: DEFAULT_HERO
  },
  featuredproducts: {
    title: 'Explore Featured Collections & Digital Assets',
    description: 'Featured product collection cards for E-Books and Websites with button labels and links',
    data: DEFAULT_FEATURED_PRODUCTS
  },
  digitalproducts: {
    title: 'Digital Products & UI Kits Catalog',
    description: 'Catalog items, banner slides, and categories for /digital-products',
    data: {
      title: 'UI Kits, Templates & Digital Assets',
      badge: 'Production-Ready Assets',
      subtitle: 'Explore high-converting website templates, responsive Figma design systems, mobile UI kits, and developer boilerplates.',
      accentColor: '#FF5E00',
      bannerSlides: [
        {
          id: 'banner-dp-1',
          tag: '🔥 BESTSELLER 2026',
          title: 'SuperUI Figma & React Design System',
          description: 'Over 120+ responsive components, tokenized themes, and 40 pre-built page layouts.',
          ctaText: 'Get The Pro Bundle',
          discount: '50% OFF',
          image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=85',
          accent: '#FF5E00'
        }
      ],
      categories: [
        { id: 'all', name: 'All Assets', icon: 'Sparkles', count: 9 },
        { id: 'ui-kits', name: 'UI Kits & Systems', icon: 'Layers', count: 3 },
        { id: 'websites', name: 'Website Templates', icon: 'Globe', count: 2 },
        { id: 'mobile', name: 'Mobile App Kits', icon: 'Smartphone', count: 2 },
        { id: 'dashboards', name: 'SaaS Dashboards', icon: 'Layout', count: 2 }
      ],
      products: [
        {
          id: 'dp-1',
          title: 'SuperUI Complete Figma Design System & Pro Kit',
          category: 'ui-kits',
          categoryName: 'UI Kits & Systems',
          description: 'Comprehensive Figma library featuring 140+ interactive components, autolayout 5.0, dark mode tokens, and mobile variants.',
          price: 39,
          originalPrice: 79,
          discount: '50% OFF',
          rating: 4.9,
          reviewsCount: 142,
          isBestseller: true,
          image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
          images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'],
          badges: ['50% OFF'],
          buyLink: 'https://www.instagram.com/p/DeS-JkIzRyi/',
          buyButtonLabel: 'Buy Now',
          tags: ['Figma 5.0', 'React Ready', 'Design Tokens'],
          format: 'Figma (.fig) + React Components'
        },
        {
          id: 'dp-2',
          title: 'SaaSify: Cloud Dashboard & Real-Time Analytics UI',
          category: 'dashboards',
          categoryName: 'SaaS Dashboards',
          description: 'Turnkey SaaS admin console with 25+ chart variants, user management, billing flows, and responsive sidebar navigation.',
          price: 49,
          originalPrice: 89,
          discount: '45% OFF',
          rating: 4.8,
          reviewsCount: 98,
          isBestseller: true,
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
          images: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'],
          badges: ['45% OFF'],
          buyLink: 'https://www.instagram.com/p/DeS-JkIzRyi/',
          buyButtonLabel: 'Buy Now',
          tags: ['Tailwind v4', 'Recharts', 'TypeScript'],
          format: 'Next.js + Vite Source Files'
        },
        {
          id: 'dp-3',
          title: 'Aura Agency & Creative Studio Portfolio Template',
          category: 'websites',
          categoryName: 'Website Templates',
          description: 'Sleek, fluid animated portfolio template crafted for agencies, freelance engineers, and creative digital directors.',
          price: 29,
          originalPrice: 59,
          discount: '50% OFF',
          rating: 4.9,
          reviewsCount: 76,
          isBestseller: false,
          image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
          images: ['https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80'],
          badges: ['50% OFF'],
          buyLink: 'https://www.instagram.com/p/DeS-JkIzRyi/',
          buyButtonLabel: 'Buy Now',
          tags: ['Framer Motion', 'SEO Optimized', 'Tailwind'],
          format: 'HTML5 + React Vite Template'
        },
        {
          id: 'dp-4',
          title: 'Fintech Mobile: Banking & Crypto iOS/Android UI Kit',
          category: 'mobile',
          categoryName: 'Mobile App Kits',
          description: '60+ mobile application screens for digital wallets, currency transfers, portfolio graphs, and card management.',
          price: 34,
          originalPrice: 68,
          discount: '50% OFF',
          rating: 4.9,
          reviewsCount: 114,
          isBestseller: true,
          image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80',
          images: ['https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80'],
          badges: ['50% OFF'],
          buyLink: 'https://www.instagram.com/p/DeS-JkIzRyi/',
          buyButtonLabel: 'Buy Now',
          tags: ['iOS & Android', 'Auto-Layout', 'Design Tokens'],
          format: 'Figma + React Native Layouts'
        },
        {
          id: 'dp-5',
          title: 'Prism: Design Tokens & Tailwind Component UI System',
          category: 'ui-kits',
          categoryName: 'UI Kits & Systems',
          description: 'Over 120 accessible design tokens, color schemes, responsive forms, and atomic elements tailored for Tailwind v4.',
          price: 24,
          originalPrice: 49,
          discount: '51% OFF',
          rating: 4.7,
          reviewsCount: 63,
          isBestseller: false,
          image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800&q=80',
          images: ['https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800&q=80'],
          badges: ['51% OFF'],
          buyLink: 'https://www.instagram.com/p/DeS-JkIzRyi/',
          buyButtonLabel: 'Buy Now',
          tags: ['Design Tokens', 'Tailwind v4', 'Clean Code'],
          format: 'Figma + React Tailwind Tokens'
        },
        {
          id: 'dp-6',
          title: 'Glass 3D Holographic Tech & Cyber Icon Pack',
          category: 'ui-kits',
          categoryName: 'UI Kits & Systems',
          description: '250+ custom 3D glassmorphism icons rendered in 4K resolution with customizable lighting and color maps.',
          price: 19,
          originalPrice: 39,
          discount: '50% OFF',
          rating: 4.8,
          reviewsCount: 88,
          isBestseller: true,
          image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
          images: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'],
          badges: ['50% OFF'],
          buyLink: 'https://www.instagram.com/p/DeS-JkIzRyi/',
          buyButtonLabel: 'Buy Now',
          tags: ['4K PNG', 'Figma Assets', 'Transparent Alpha'],
          format: 'PNG, SVG, Blender (.blend)'
        },
        {
          id: 'dp-7',
          title: 'Nexus: Multi-Vendor Marketplace & E-Commerce Kit',
          category: 'websites',
          categoryName: 'Website Templates',
          description: 'Complete storefront system featuring checkout flows, product filters, cart drawers, and customer account portals.',
          price: 44,
          originalPrice: 89,
          discount: '50% OFF',
          rating: 4.9,
          reviewsCount: 91,
          isBestseller: true,
          image: 'https://images.unsplash.com/photo-1556742049-0a67e557224f?auto=format&fit=crop&w=800&q=80',
          images: ['https://images.unsplash.com/photo-1556742049-0a67e557224f?auto=format&fit=crop&w=800&q=80'],
          badges: ['50% OFF'],
          buyLink: 'https://www.instagram.com/p/DeS-JkIzRyi/',
          buyButtonLabel: 'Buy Now',
          tags: ['Stripe Ready', 'Cart System', 'Fully Responsive'],
          format: 'Next.js + Tailwind React'
        },
        {
          id: 'dp-8',
          title: 'DevDash: Developer Tools & API Management Dashboard',
          category: 'dashboards',
          categoryName: 'SaaS Dashboards',
          description: 'Engineered for cloud platforms: logs viewer, API key generators, rate limit meters, and server status displays.',
          price: 38,
          originalPrice: 75,
          discount: '49% OFF',
          rating: 4.8,
          reviewsCount: 52,
          isBestseller: false,
          image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
          images: ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'],
          badges: ['49% OFF'],
          buyLink: 'https://www.instagram.com/p/DeS-JkIzRyi/',
          buyButtonLabel: 'Buy Now',
          tags: ['Dark Theme', 'WebSocket Ready', 'Clean Architecture'],
          format: 'React + Tailwind Source'
        },
        {
          id: 'dp-9',
          title: 'SocialPulse: Creator & Community Mobile App UI',
          category: 'mobile',
          categoryName: 'Mobile App Kits',
          description: 'Modern social feed, stories, messaging, audio room, and profile views crafted with native gesture interactions.',
          price: 28,
          originalPrice: 56,
          discount: '50% OFF',
          rating: 4.7,
          reviewsCount: 45,
          isBestseller: false,
          image: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=800&q=80',
          images: ['https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=800&q=80'],
          badges: ['50% OFF'],
          buyLink: 'https://www.instagram.com/p/DeS-JkIzRyi/',
          buyButtonLabel: 'Buy Now',
          tags: ['Micro-Interactions', 'Component System', 'Figma'],
          format: 'Figma (.fig) Source'
        }
      ]
    }
  },
  ebooks: {
    title: 'E-Books & Digital Guides Catalog',
    description: 'Catalog items, banner slides, and categories for /ebooks-digital',
    data: {
      title: 'All Types of E-Books & Digital Guides',
      badge: 'Curated Knowledge Library',
      subtitle: 'Expert e-books and actionable roadmaps across Spiritual Devotion, Fitness & Nutrition, Tech Engineering, and Business Growth.',
      accentColor: '#7C3AED',
      bannerSlides: [
        {
          id: 'banner-eb-1',
          tag: '⭐ BESTSELLER BUNDLE',
          title: 'Devotional & Mindful Living Series',
          description: 'Daily spiritual reflections, guided meditations, and practical steps to find calm in a busy world.',
          ctaText: 'Explore Devotional Pack',
          discount: '40% OFF',
          image: '/E_Books.png',
          accent: '#7C3AED'
        }
      ],
      categories: [
        { id: 'all', name: 'All E-Books', icon: 'BookOpen', count: 9 },
        { id: 'devotional', name: 'Devotional & Spiritual', icon: 'Heart', count: 2 },
        { id: 'fitness', name: 'Fitness & Health', icon: 'Activity', count: 2 },
        { id: 'tech', name: 'Tech & Engineering', icon: 'Code', count: 2 },
        { id: 'business', name: 'Business & Growth', icon: 'TrendingUp', count: 2 },
        { id: 'recipes', name: 'Cookbooks & Recipes', icon: 'Coffee', count: 1 }
      ],
      products: [
        {
          id: 'eb-1',
          title: 'The Mindful Soul: 365 Days of Devotion & Spiritual Peace',
          category: 'devotional',
          categoryName: 'Devotional & Spiritual',
          description: 'Deepen your daily mindfulness and spiritual connection with morning devotions, reflective prompts, and evening calm affirmations.',
          price: 14.99,
          originalPrice: 29.99,
          discount: '50% OFF',
          rating: 4.95,
          reviewsCount: 312,
          isBestseller: true,
          image: '/E_Books.png',
          images: ['/E_Books.png'],
          badges: ['50% OFF'],
          buyLink: 'https://www.instagram.com/p/DeS-JkIzRyi/',
          buyButtonLabel: 'Buy Now',
          tags: ['PDF + EPUB', 'Audio Companion', 'Printable Journal'],
          format: 'Instant Digital PDF + EPUB + Audio'
        },
        {
          id: 'eb-2',
          title: 'The Ultimate 12-Week Strength, Hypertrophy & Nutrition Blueprint',
          category: 'fitness',
          categoryName: 'Fitness & Health',
          description: 'Comprehensive workout program for home and gym, accompanied by custom calorie/macro calculation formulas and video guides.',
          price: 18.99,
          originalPrice: 38.00,
          discount: '50% OFF',
          rating: 4.9,
          reviewsCount: 189,
          isBestseller: true,
          image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
          images: ['https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80'],
          badges: ['50% OFF'],
          buyLink: 'https://www.instagram.com/p/DeS-JkIzRyi/',
          buyButtonLabel: 'Buy Now',
          tags: ['Workout Logs', 'Meal Calculator', 'Video Links'],
          format: 'Interactive PDF + Notion Template'
        },
        {
          id: 'eb-3',
          title: 'Modern Full-Stack SaaS Architecture & Microservices Handbook',
          category: 'tech',
          categoryName: 'Tech & Engineering',
          description: 'Master enterprise Next.js, Node.js, PostgreSQL design, caching strategies, Docker deployment, and payment architecture.',
          price: 24.99,
          originalPrice: 49.99,
          discount: '50% OFF',
          rating: 4.92,
          reviewsCount: 167,
          isBestseller: true,
          image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
          images: ['https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80'],
          badges: ['50% OFF'],
          buyLink: 'https://www.instagram.com/p/DeS-JkIzRyi/',
          buyButtonLabel: 'Buy Now',
          tags: ['Source Code', 'Architecture Charts', 'Production Ready'],
          format: 'PDF + GitHub Repository Access'
        },
        {
          id: 'eb-4',
          title: 'Zero to $10K MRR: The Solopreneur Digital Product Playbook',
          category: 'business',
          categoryName: 'Business & Growth',
          description: 'Step-by-step strategy for discovering profitable niches, validating offers, writing high-converting copy, and automated distribution.',
          price: 19.99,
          originalPrice: 39.99,
          discount: '50% OFF',
          rating: 4.88,
          reviewsCount: 145,
          isBestseller: true,
          image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
          images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'],
          badges: ['50% OFF'],
          buyLink: 'https://www.instagram.com/p/DeS-JkIzRyi/',
          buyButtonLabel: 'Buy Now',
          tags: ['Sales Funnels', 'Email Swipes', 'Case Studies'],
          format: 'PDF + Financial Model Spreadsheets'
        },
        {
          id: 'eb-5',
          title: 'Inner Stillness: Guided Prayers, Scriptures & Evening Meditations',
          category: 'devotional',
          categoryName: 'Devotional & Spiritual',
          description: 'Centering verses, guided breathwork, and healing reflections designed to reduce anxiety, promote gratitude, and restore peaceful rest.',
          price: 12.99,
          originalPrice: 24.99,
          discount: '48% OFF',
          rating: 4.91,
          reviewsCount: 94,
          isBestseller: false,
          image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
          images: ['https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80'],
          badges: ['48% OFF'],
          buyLink: 'https://www.instagram.com/p/DeS-JkIzRyi/',
          buyButtonLabel: 'Buy Now',
          tags: ['Soothing Audio', 'Daily Prompts', 'EPUB Reader'],
          format: 'PDF + MP3 Audio Files'
        },
        {
          id: 'eb-6',
          title: 'Plant-Powered Mediterranean Kitchen: 80 Quick Recipes',
          category: 'recipes',
          categoryName: 'Cookbooks & Recipes',
          description: 'Wholesome, vibrant 30-minute meals inspired by the Mediterranean blue zones, complete with grocery checklists and calorie counts.',
          price: 15.99,
          originalPrice: 29.99,
          discount: '47% OFF',
          rating: 4.85,
          reviewsCount: 128,
          isBestseller: false,
          image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80',
          images: ['https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80'],
          badges: ['47% OFF'],
          buyLink: 'https://www.instagram.com/p/DeS-JkIzRyi/',
          buyButtonLabel: 'Buy Now',
          tags: ['Color Photos', 'Shopping Lists', 'Nutritional Facts'],
          format: 'Full Color PDF + Printable Cards'
        },
        {
          id: 'eb-7',
          title: 'Deep Work & Habit Mastery for High-Output Creators',
          category: 'business',
          categoryName: 'Business & Growth',
          description: 'Eliminate digital distractions, optimize cognitive energy blocks, and double your output while working fewer hours.',
          price: 13.99,
          originalPrice: 27.99,
          discount: '50% OFF',
          rating: 4.84,
          reviewsCount: 82,
          isBestseller: false,
          image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=800&q=80',
          images: ['https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=800&q=80'],
          badges: ['50% OFF'],
          buyLink: 'https://www.instagram.com/p/DeS-JkIzRyi/',
          buyButtonLabel: 'Buy Now',
          tags: ['Habit Tracker', 'Time Blocking', 'Audiobook'],
          format: 'PDF + Notion Daily Planner'
        },
        {
          id: 'eb-8',
          title: 'Clean Code in React 19: Design Patterns & Performance',
          category: 'tech',
          categoryName: 'Tech & Engineering',
          description: 'Modern idioms, server components, optimistic updates, concurrency, performance profiling, and memory leak prevention.',
          price: 22.99,
          originalPrice: 45.00,
          discount: '49% OFF',
          rating: 4.94,
          reviewsCount: 204,
          isBestseller: true,
          image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
          images: ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'],
          badges: ['49% OFF'],
          buyLink: 'https://www.instagram.com/p/DeS-JkIzRyi/',
          buyButtonLabel: 'Buy Now',
          tags: ['React 19', 'Interactive Demos', 'Cheatsheets'],
          format: 'PDF + Interactive Code Sandboxes'
        },
        {
          id: 'eb-9',
          title: 'Holistic Gut Health & Metabolic Reset Protocol',
          category: 'fitness',
          categoryName: 'Fitness & Health',
          description: 'A 28-day restorative protocol to improve digestion, balance hormones, boost natural daytime energy, and eliminate chronic fatigue.',
          price: 16.99,
          originalPrice: 32.00,
          discount: '47% OFF',
          rating: 4.79,
          reviewsCount: 61,
          isBestseller: false,
          image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
          images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'],
          badges: ['47% OFF'],
          buyLink: 'https://www.instagram.com/p/DeS-JkIzRyi/',
          buyButtonLabel: 'Buy Now',
          tags: ['Meal Plans', 'Supplement Guide', 'Symptom Tracker'],
          format: 'PDF Guide + Printable Protocol'
        }
      ]
    }
  },
  marquee: {
    title: 'Scrolling Marquee Bands',
    description: 'The two rows of capability chips that scroll beneath the hero',
    data: DEFAULT_MARQUEE
  },
  services: {
    title: 'Tailored Services & AI Capabilities',
    description: '15 service categories with the full sub-service catalogue we deliver',
    data: DEFAULT_SERVICES_SECTION
  },
  howItWorks: {
    title: 'How It Works Process Flow',
    description: '4-step delivery lifecycle and engagement process',
    data: DEFAULT_HOW_IT_WORKS
  },
  whyUs: {
    title: 'Why Us & Performance Metrics',
    description: 'Trust signals, metrics, and competitive advantages',
    data: DEFAULT_WHY_US
  },
  contact: {
    title: 'Contact Section',
    description: 'Heading, contact points, guarantees and the inquiry form card',
    data: DEFAULT_CONTACT
  },
  ctaBand: {
    title: 'Bottom Call To Action Band',
    description: 'Pre-footer call to action heading, subtext and button',
    data: DEFAULT_CTA_BAND
  },
  footer: {
    title: 'Footer & Link Groups',
    description: 'Brand tagline, link groups, contact details and legal lines',
    data: DEFAULT_FOOTER
  },
  contactModal: {
    title: 'Contact Modal',
    description: 'Copy shown in the inquiry modal opened from any CTA',
    data: DEFAULT_CONTACT_MODAL
  },
  contactForm: {
    title: 'Contact Form Labels & Messaging',
    description: 'Field labels, placeholders, submit text and success/errr messages',
    data: DEFAULT_CONTACT_FORM
  },
  seo: {
    title: 'SEO & Social Metadata',
    description: 'Document title, meta description, keywords and Open Graph / Twitter tags',
    data: DEFAULT_SEO
  }
};

module.exports = {
  DEFAULT_SERVICES,
  DEFAULT_SERVICES_HEADER,
  DEFAULT_SERVICES_SECTION,
  DEFAULT_NAVBAR,
  DEFAULT_HERO,
  DEFAULT_MARQUEE,
  DEFAULT_WHY_US,
  DEFAULT_HOW_IT_WORKS,
  DEFAULT_CONTACT,
  DEFAULT_CTA_BAND,
  DEFAULT_FOOTER,
  DEFAULT_CONTACT_MODAL,
  DEFAULT_CONTACT_FORM,
  DEFAULT_SEO,
  DEFAULT_SECTIONS,
  /** Section keys that may never be deleted, because the site depends on them. */
  PROTECTED_SECTION_KEYS: ['services']
};