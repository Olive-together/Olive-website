import React from 'react';
import { StaticPageHeader, StaticPageContent } from '@/components/StaticPageHeader';
import { StaticSection } from '@/components/StaticSection';

export function ContactPage() {
  return (
    <div className="animate-fade-in">
      <StaticPageHeader 
        title="Contact Us" 
        subtitle="We&apos;d love to hear from you. Reach out with questions, feedback, or just to say hi."
      />
      <StaticPageContent>
        
        <StaticSection id="reach-out" title="Get in Touch">
          <p>Have a question that isn&apos;t answered in our Help Center? Want to explore a partnership?</p><div className="bg-olive-50 p-6 rounded-xl border border-olive-100 mt-6"><p className="font-medium text-olive-900">Email Support</p><p className="text-olive-600 mb-4">support@letsdotogether.com</p><p className="font-medium text-olive-900">Press & Partnerships</p><p className="text-olive-600">hello@letsdotogether.com</p></div>
        </StaticSection>
        <StaticSection id="socials" title="Follow Us">
          <p>Stay updated with our latest news and community highlights on our social channels.</p>
        </StaticSection>
      </StaticPageContent>
    </div>
  );
}
