import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pages = [
  {
    name: 'HowItWorksPage',
    title: 'How It Works',
    subtitle: 'Learn how LetsDoTogether connects you with people who share your passions.',
    sections: [
      { id: 'discover', title: '1. Discover Activities', content: '<p>Browse through hundreds of activities created by our community. Whether it&apos;s a weekend hike, a coffee meetup, or a coding session, there&apos;s something for everyone.</p>' },
      { id: 'join', title: '2. Join and Connect', content: '<p>Find an activity you like? Join it with a single click. Start chatting with other participants before the event and break the ice early.</p>' },
      { id: 'meet', title: '3. Meet in Real Life', content: '<p>The best connections happen offline. Show up, share your interests, and build meaningful relationships in the real world.</p>' }
    ]
  },
  {
    name: 'HelpPage',
    title: 'Help Center',
    subtitle: 'Find answers to common questions and learn how to get the most out of LetsDoTogether.',
    sections: [
      { id: 'getting-started', title: 'Getting Started', content: '<p>Creating an account is free and easy. Once signed up, complete your profile with your interests so we can recommend the best activities for you.</p>' },
      { id: 'hosting', title: 'Hosting Activities', content: '<p>Anyone can host an activity! Just click Create Activity, set a time, place, and topic, and wait for people to join. You have full control over who attends.</p>' },
      { id: 'faq', title: 'Frequently Asked Questions', content: '<ul className="list-disc pl-5 space-y-2"><li><strong>Is it free?</strong> Yes, using the platform is entirely free.</li><li><strong>Can I charge for my activities?</strong> You can indicate if an activity has costs involved, but transactions must be handled off-platform.</li></ul>' }
    ]
  },
  {
    name: 'ContactPage',
    title: 'Contact Us',
    subtitle: 'We&apos;d love to hear from you. Reach out with questions, feedback, or just to say hi.',
    sections: [
      { id: 'reach-out', title: 'Get in Touch', content: '<p>Have a question that isn&apos;t answered in our Help Center? Want to explore a partnership?</p><div className="bg-olive-50 p-6 rounded-xl border border-olive-100 mt-6"><p className="font-medium text-olive-900">Email Support</p><p className="text-olive-600 mb-4">support@letsdotogether.com</p><p className="font-medium text-olive-900">Press & Partnerships</p><p className="text-olive-600">hello@letsdotogether.com</p></div>' },
      { id: 'socials', title: 'Follow Us', content: '<p>Stay updated with our latest news and community highlights on our social channels.</p>' }
    ]
  },
  {
    name: 'CommunityPage',
    title: 'Community Standards',
    subtitle: 'Our guidelines for building a safe, inclusive, and welcoming environment for everyone.',
    sections: [
      { id: 'guidelines', title: 'Community Guidelines', content: '<p>We believe in mutual respect. Be kind, inclusive, and considerate of others. Harassment, discrimination, or hate speech of any kind will result in immediate account termination.</p>' },
      { id: 'safety', title: 'Safety First', content: '<p>Your safety is our top priority. We recommend meeting in public places for the first time. Trust your instincts and never feel obligated to share personal information like your home address or financial details.</p>' },
      { id: 'reporting', title: 'Reporting & Blocking', content: '<p>If someone makes you uncomfortable, you can easily block them from their profile page. To report a serious violation of our guidelines, use the Report button or contact our support team directly. We review all reports promptly.</p>' },
      { id: 'respect', title: 'Respectful Behavior', content: '<p>Show up when you say you will. If you need to cancel, let the host know as early as possible. Respect everyone&apos;s time and effort.</p>' }
    ]
  },
  {
    name: 'RoadmapPage',
    title: 'Product Roadmap',
    subtitle: 'See what we&apos;re working on next and how the platform is evolving.',
    sections: [
      { id: 'now', title: 'Now (Q4 2026)', content: '<ul className="list-disc pl-5 space-y-2"><li>Enhanced group chat features</li><li>Advanced activity discovery filters</li><li>Mobile application beta</li></ul>' },
      { id: 'next', title: 'Next (Q1 2027)', content: '<ul className="list-disc pl-5 space-y-2"><li>Paid activities integration</li><li>Community verification badges</li><li>Location-based smart recommendations</li></ul>' },
      { id: 'future', title: 'Future', content: '<p>We are constantly exploring new ways to connect people. Long term, we plan to introduce community-led chapters and organizational accounts.</p>' }
    ]
  },
  {
    name: 'FeatureRequestsPage',
    title: 'Feature Requests',
    subtitle: 'Help us shape the future of LetsDoTogether.',
    sections: [
      { id: 'submit', title: 'Submit a Request', content: '<p>Got a great idea? We want to hear it! Because we are an open-source project, the best place to submit and vote on feature requests is on our GitHub Discussions board.</p><div className="mt-6"><a href="#" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-olive-500 text-white text-sm font-semibold rounded-xl hover:bg-olive-400 hover:shadow-[0_4px_16px_rgba(139,180,81,0.3)] hover:-translate-y-0.5 transition-all duration-200">Open GitHub Discussions</a></div>' },
      { id: 'process', title: 'How We Prioritize', content: '<p>We review community feedback weekly. Features that receive the most upvotes and align with our core mission of connecting people offline are prioritized for development.</p>' }
    ]
  },
  {
    name: 'ContributePage',
    title: 'Contribute to Olive',
    subtitle: 'LetsDoTogether is built in the open. Join our community of contributors.',
    sections: [
      { id: 'code', title: 'Code Contributions', content: '<p>Our stack is React, TypeScript, and Node.js. Check out our GitHub repository to find issues labeled "good first issue" or "help wanted". We welcome pull requests from developers of all skill levels.</p>' },
      { id: 'non-code', title: 'Other Ways to Help', content: '<p>Not a developer? No problem! You can contribute by translating the app, writing documentation, reporting bugs, or simply by hosting amazing activities in your city and spreading the word.</p>' }
    ]
  },
  {
    name: 'DocumentationPage',
    title: 'Documentation',
    subtitle: 'Technical guides and resources for developers and contributors.',
    sections: [
      { id: 'getting-started', title: 'Getting Started', content: '<p>To run the project locally, clone the repository, install dependencies using `npm install`, and start the development server with `npm run dev`. See our README for full setup instructions.</p>' },
      { id: 'architecture', title: 'Architecture Overview', content: '<p>The platform uses a monolithic backend built with NestJS and Prisma, communicating with a React frontend via REST and WebSockets for real-time chat.</p>' }
    ]
  },
  {
    name: 'ChangelogPage',
    title: 'Changelog',
    subtitle: 'Keep track of the latest updates, fixes, and improvements.',
    sections: [
      { id: 'latest', title: 'v1.4.0 - September 2026', content: '<ul className="list-disc pl-5 space-y-2"><li><strong>New:</strong> Completely redesigned public architecture and footer.</li><li><strong>New:</strong> Independent scroll regions for messages page.</li><li><strong>Fixed:</strong> Map rendering bugs on mobile devices.</li></ul>' },
      { id: 'previous', title: 'v1.3.2 - August 2026', content: '<ul className="list-disc pl-5 space-y-2"><li><strong>Improved:</strong> Activity feed performance and infinite scrolling.</li><li><strong>Fixed:</strong> Real-time chat connection drops on spotty networks.</li></ul>' }
    ]
  },
  {
    name: 'PrivacyPage',
    title: 'Privacy Policy',
    subtitle: 'How we collect, use, and protect your personal information.',
    sections: [
      { id: 'policy', title: 'Privacy Policy', content: '<p>We are committed to protecting your privacy. We only collect information necessary to provide our service, such as your basic profile details and location to show nearby activities.</p>' },
      { id: 'data', title: 'Data Usage', content: '<p>Your data is never sold to third parties. We use it strictly to improve your experience, match you with relevant activities, and ensure platform safety.</p>' },
      { id: 'deletion', title: 'Account and Data Deletion', content: '<p>You have the right to be forgotten. You can permanently delete your account and all associated data at any time from your account settings.</p>' },
      { id: 'cookies', title: 'Cookies Section', content: '<p>We use essential cookies to keep you logged in and securely authenticate your session. We do not use third-party tracking or advertising cookies.</p>' }
    ]
  },
  {
    name: 'TermsPage',
    title: 'Terms of Service',
    subtitle: 'The rules governing your use of LetsDoTogether.',
    sections: [
      { id: 'acceptance', title: 'Acceptance of Terms', content: '<p>By creating an account, you agree to abide by these Terms of Service and our Community Guidelines. If you do not agree, you may not use the platform.</p>' },
      { id: 'liability', title: 'Limitation of Liability', content: '<p>LetsDoTogether is a platform to facilitate real-world connections. We are not responsible for the conduct of users offline. Always exercise caution and common sense when meeting people from the internet.</p>' },
      { id: 'termination', title: 'Account Termination', content: '<p>We reserve the right to suspend or terminate accounts that violate our terms or community guidelines without prior notice.</p>' }
    ]
  },
  {
    name: 'SecurityPage',
    title: 'Security',
    subtitle: 'Our approach to keeping the platform and your data secure.',
    sections: [
      { id: 'practices', title: 'Security Practices', content: '<p>All traffic is encrypted via HTTPS. We use industry-standard hashing for passwords and secure token-based authentication. Our databases are regularly backed up and access is strictly controlled.</p>' },
      { id: 'vulnerabilities', title: 'Vulnerability Reporting', content: '<p>If you believe you have found a security vulnerability in our platform, please do not disclose it publicly. Email us directly at security@letsdotogether.com.</p>' },
      { id: 'disclosure', title: 'Responsible Disclosure', content: '<p>We will acknowledge your report within 48 hours and work with you to resolve the issue as quickly as possible. We appreciate the efforts of the security community in keeping our users safe.</p>' }
    ]
  }
];

const template = (page) => `import React from 'react';
import { StaticPageHeader, StaticPageContent } from '@/components/StaticPageHeader';
import { StaticSection } from '@/components/StaticSection';

export function ${page.name}() {
  return (
    <div className="animate-fade-in">
      <StaticPageHeader 
        title="${page.title}" 
        subtitle="${page.subtitle}"
      />
      <StaticPageContent>
        ${page.sections.map(s => `
        <StaticSection id="${s.id}" title="${s.title}">
          ${s.content}
        </StaticSection>`).join('')}
      </StaticPageContent>
    </div>
  );
}
`;

const dir = path.join(__dirname, 'src', 'pages', 'public');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

pages.forEach(p => {
  fs.writeFileSync(path.join(dir, p.name + '.tsx'), template(p));
});
console.log('Created ' + pages.length + ' pages');
