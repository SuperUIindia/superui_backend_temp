// Configuration (MongoDB URI, DNS resolvers) is read from backend/.env only.
const { config } = require('../src/config/env');
const mongoose = require('mongoose');
const SiteContent = require('../src/models/SiteContent');

// Exact list requested by the user, in order.
const REQUESTED = {
  'Website Development': ['Business website development','Corporate website','Portfolio website','Landing page development','Personal website','Blog website','News/magazine website','Booking website','Membership website','Directory/listing website','Custom web applications','Progressive Web Apps (PWA)'],
  'E-commerce Development': ['E-commerce website','Online store development','Custom shopping website','Product catalog website','Multi-vendor marketplace','Digital-product store','Subscription website','Payment gateway integration','Shopping cart & checkout','Order management system','Inventory management','Coupon/discount systems'],
  'Admin & Business Systems': ['Admin dashboard development','Custom admin panel','CRM development','Customer management system','Order management','Invoice management','Employee management','Inventory dashboard','Analytics dashboard','Booking management','Customer support dashboard','Internal business tools'],
  'UI/UX & Design': ['Website UI design','SaaS UI design','Dashboard UI','Mobile UI','Landing page design','E-commerce UI','Design systems','UI component libraries','Figma design','UX research','Wireframes','Prototypes','Website redesign'],
  'React & Frontend Development': ['React.js development','Next.js development','Responsive frontend','React dashboard','React component development','SaaS frontend','API integration','Authentication UI','Payment UI','Performance optimization','Frontend bug fixing'],
  'Backend & API Development': ['Node.js development','Express.js APIs','REST API development','Authentication systems','Authorization/RBAC','Database integration','Third-party API integration','Webhooks','Payment APIs','Email APIs','File-storage systems','Backend optimization'],
  'Website Maintenance': ['Website maintenance','Security updates','Bug fixing','Content updates','Product updates','Backup management','Performance optimization','Database maintenance','SSL/domain assistance','Hosting management','Broken-page fixing','Mobile responsiveness fixes','Monthly maintenance plans'],
  'Security Services': ['Website security audit','Authentication implementation','MFA/TOTP integration','Role-based access control','API security','Secure file downloads','Payment security integration','Rate limiting','CAPTCHA/anti-spam','Security headers','Backup strategy','Vulnerability review'],
  'Cloud & Deployment': ['Vercel deployment','Cloudflare configuration','VPS deployment','Node.js deployment','Database deployment','Domain configuration','DNS configuration','SSL setup','CDN configuration','Cloud storage','Object storage integration','Production environment setup','CI/CD setup'],
  'Digital Products': ['React UI components','HTML/CSS templates','SaaS templates','Dashboard templates','Landing-page templates','Portfolio templates','E-commerce templates','Figma UI kits','Design systems','Icons','Illustrations','Website templates','Admin templates','Code snippets','Starter projects','Boilerplates','Developer resources'],
  'Ebooks & Educational Products': ['Web development ebooks','React ebooks','JavaScript ebooks','UI/UX ebooks','CSS ebooks','Design-system guides','SEO guides','Freelancing guides','Business/technology guides','Programming cheat sheets','PDF guides','Coding resources','Video courses','Mini courses','Developer checklists'],
  'SEO & Digital Marketing': ['SEO setup','Technical SEO','On-page SEO','Website SEO audit','Keyword research','Search Console setup','Google Analytics setup','Meta Pixel setup','Conversion tracking','Landing-page optimization','Social-media setup','Social-media creatives','Paid-ad landing pages'],
  'Automation': ['Business automation','Email automation','Lead management','Form-to-email automation','Invoice automation','Order automation','Telegram notifications','WhatsApp integrations','CRM automation','Webhook automation','Scheduled reports','Excel/Google Sheets automation','API automation'],
  'Payment & Digital Delivery': ['Razorpay integration','Stripe integration','Payment gateway setup','Payment webhook integration','Order processing','Digital product delivery','Secure download links','Temporary download URLs','Invoice generation','Email delivery','Payment-failure handling','Refund workflow'],
  'Hosting & Domain Services': ['Domain setup','DNS configuration','Cloudflare setup','Hosting setup','VPS setup','Website migration','SSL setup','Email-domain setup','CDN configuration','Server monitoring','Backup configuration']
};

(async () => {
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 8000 });
  const doc = await SiteContent.findOne({ key: 'services' });
  const cats = doc.data.categories;

  console.log('header:', JSON.stringify(doc.data.header, null, 0));
  console.log('categories in DB:', cats.length, '| requested:', Object.keys(REQUESTED).length);

  let problems = 0;
  const reqNames = Object.keys(REQUESTED);

  cats.forEach((cat, i) => {
    const want = REQUESTED[cat.title];
    const got = cat.items || [];
    const orderOk = want ? want.length === got.length && want.every((v, j) => v === got[j]) : false;
    const missing = want ? want.filter((x) => !got.includes(x)) : [];
    const extra = got.filter((x) => !(want || []).includes(x));
    const expectedOrder = reqNames.indexOf(cat.title) === i;
    if (!want || !orderOk || !expectedOrder) problems++;
    console.log(
      `${String(i + 1).padStart(2)}. ${cat.title.padEnd(30)} items=${String(got.length).padStart(2)}/${String(want ? want.length : 0).padEnd(2)} ` +
      `${want ? 'OK ' : 'UNKNOWN-TITLE '}${orderOk ? 'exact-order' : 'MISMATCH'}${expectedOrder ? '' : ' WRONG-POSITION'}` +
      `${missing.length ? ' missing=' + JSON.stringify(missing) : ''}${extra.length ? ' extra=' + JSON.stringify(extra) : ''}`
    );
  });

  const missingCats = reqNames.filter((n) => !cats.some((c) => c.title === n));
  console.log('\ntotal sub-services in DB:', cats.reduce((n, c) => n + c.items.length, 0));
  console.log('total requested:', Object.values(REQUESTED).reduce((n, a) => n + a.length, 0));
  console.log('categories missing from DB:', missingCats.length ? missingCats.join(', ') : 'none');
  console.log(problems === 0 && missingCats.length === 0
    ? '\nRESULT: DB catalogue matches the requested list exactly.'
    : `\nRESULT: ${problems} problem(s) found.`);

  await mongoose.disconnect();
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });