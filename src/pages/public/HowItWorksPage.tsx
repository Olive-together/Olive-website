import React from 'react';
import { StaticPageHeader, StaticPageContent } from '@/components/StaticPageHeader';
import { StaticSection } from '@/components/StaticSection';

export function HowItWorksPage() {
  return (
    <div className="animate-fade-in">
      <StaticPageHeader 
        title="How It Works" 
        subtitle="Learn how LetsDoTogether connects you with people who share your passions."
      />
      <StaticPageContent>
        
        <StaticSection id="discover" title="1. Discover Activities">
          <p>Browse through hundreds of activities created by our community. Whether it&apos;s a weekend hike, a coffee meetup, or a coding session, there&apos;s something for everyone.</p>
        </StaticSection>
        <StaticSection id="join" title="2. Join and Connect">
          <p>Find an activity you like? Join it with a single click. Start chatting with other participants before the event and break the ice early.</p>
        </StaticSection>
        <StaticSection id="meet" title="3. Meet in Real Life">
          <p>The best connections happen offline. Show up, share your interests, and build meaningful relationships in the real world.</p>
        </StaticSection>
      </StaticPageContent>
    </div>
  );
}
