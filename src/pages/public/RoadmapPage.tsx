import React from 'react';
import { StaticPageHeader, StaticPageContent } from '@/components/StaticPageHeader';
import { StaticSection } from '@/components/StaticSection';

export function RoadmapPage() {
  return (
    <div className="animate-fade-in">
      <StaticPageHeader 
        title="Product Roadmap" 
        subtitle="See what we&apos;re working on next and how the platform is evolving."
      />
      <StaticPageContent>
        
        <StaticSection id="now" title="Now (Q4 2026)">
          <ul className="list-disc pl-5 space-y-2"><li>Enhanced group chat features</li><li>Advanced activity discovery filters</li><li>Mobile application beta</li></ul>
        </StaticSection>
        <StaticSection id="next" title="Next (Q1 2027)">
          <ul className="list-disc pl-5 space-y-2"><li>Paid activities integration</li><li>Community verification badges</li><li>Location-based smart recommendations</li></ul>
        </StaticSection>
        <StaticSection id="future" title="Future">
          <p>We are constantly exploring new ways to connect people. Long term, we plan to introduce community-led chapters and organizational accounts.</p>
        </StaticSection>
      </StaticPageContent>
    </div>
  );
}
