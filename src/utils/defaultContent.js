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
    'From high-converting web apps and performant dashboards to custom automations—AKHILTHADAKA delivers production-ready engineering designed for measurable business growth.',
  primaryCtaText: 'Start a Project',
  secondaryCtaText: 'View Services',
  trustPoints: ['Production-ready code', 'Secure by default', 'Fast 24h turnaround']
};

/**
 * Navbar: brand, links and CTA labels. Every link is an in-page anchor.
 */
const DEFAULT_NAVBAR = {
  brandName: 'AKHILTHADAKA',
  brandHighlight: '',
  logoUrl: '/superui_logo.png',
  homeHref: '#top',
  links: [
    { label: 'Home', href: '#top' },
    { label: 'Services', href: '#services' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Why AKHILTHADAKA', href: '#why-us' },
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
    { label: 'Location', value: 'Bengaluru, India (Serving Global Clients)' }
  ],
  guarantees: [
    'Free architecture & technical consultation',
    'Fixed upfront quote with zero hidden charges',
    'NDA signed upon request for confidential ideas'
  ],
  // The contact form renders inside the site modal, not inline. These three
  // strings are the card that invites the visitor to open that single form.
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
  brandName: 'AKHILTHADAKA',
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
    { label: 'Why AKHILTHADAKA', href: '#why-us' },
    { label: 'Start Inquiry', href: '#contact' }
  ],
  contactGroupTitle: 'Contact',
  contactItems: [
    { label: 'hello.superui@gmail.com', href: 'mailto:hello.superui@gmail.com' },
    { label: 'Response in under 24 hours' },
    { label: 'Bengaluru, India (Global Remote)' }
  ],
  copyrightText: 'AKHILTHADAKA. All rights reserved.',
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
  successBody:
    'We have received your requirements and we will contact you soon. Our team usually replies within 24 business hours.',
  successFasterReply: 'Want a faster reply?',
  successDmCta: 'Message me on Instagram',
  successFollowCta: 'Follow AKHILTHADAKA on Instagram',
  successSubmitAnother: 'Submit Another Request',
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
  title: 'AKHILTHADAKA — Web Development, UI/UX Design & Custom Software Studio',
  description:
    'AKHILTHADAKA is a full-stack web development and UI/UX design studio in Bengaluru, India. We build fast, secure, SEO-optimised websites, e-commerce stores and custom web applications. Get a fixed-price proposal within 24 hours.',
  keywords:
    'web development company Bengaluru, custom web application development, UI UX design services India, ecommerce website development, React and Next.js developers, website maintenance and SEO services, AKHILTHADAKA, SuperUI',
  author: 'AKHILTHADAKA',
  robots: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
  ogType: 'website',
  siteUrl: 'https://superui.in/',
  ogSiteName: 'AKHILTHADAKA',
  ogLocale: 'en_IN',
  ogTitle: 'AKHILTHADAKA — Web Development, UI/UX Design & Custom Software Studio',
  ogDescription:
    'A full-stack engineering and design studio in Bengaluru delivering high-speed web apps, e-commerce stores, custom software and conversion-optimised websites.',
  ogImage: 'https://superui.in/superui_logo.png',
  ogImageAlt: 'AKHILTHADAKA logo',
  twitterCard: 'summary_large_image'
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