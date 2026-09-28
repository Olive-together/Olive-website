import React from 'react';
import { StaticPageHeader, StaticPageContent } from '@/components/StaticPageHeader';
import { StaticSection } from '@/components/StaticSection';

export function HelpPage() {
  return (
    <div className="animate-fade-in">
      <StaticPageHeader 
        title="Help Center" 
        subtitle="Find answers to common questions and learn how to get the most out of LetsDoTogether."
      />
      <StaticPageContent>
        
        <StaticSection id="getting-started" title="Getting Started">
          <p>Creating an account is free and easy. Once signed up, complete your profile with your interests so we can recommend the best activities for you.</p>
        </StaticSection>
        <StaticSection id="hosting" title="Hosting Activities">
          <p>Anyone can host an activity! Just click Create Activity, set a time, place, and topic, and wait for people to join. You have full control over who attends.</p>
        </StaticSection>
        <StaticSection id="faq" title="Frequently Asked Questions">
          <ul className="list-disc pl-5 space-y-2"><li><strong>Is it free?</strong> Yes, using the platform is entirely free.</li><li><strong>Can I charge for my activities?</strong> You can indicate if an activity has costs involved, but transactions must be handled off-platform.</li></ul>
        </StaticSection>
      </StaticPageContent>
    </div>
  );
}
