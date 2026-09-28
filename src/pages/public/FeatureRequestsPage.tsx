import React from 'react';
import { StaticPageHeader, StaticPageContent } from '@/components/StaticPageHeader';
import { StaticSection } from '@/components/StaticSection';

export function FeatureRequestsPage() {
  return (
    <div className="animate-fade-in">
      <StaticPageHeader 
        title="Feature Requests" 
        subtitle="Help us shape the future of LetsDoTogether."
      />
      <StaticPageContent>
        
        <StaticSection id="submit" title="Submit a Request">
          <p>Got a great idea? We want to hear it! Because we are an open-source project, the best place to submit and vote on feature requests is on our GitHub Discussions board.</p><div className="mt-6"><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-olive-500 text-white text-sm font-semibold rounded-xl hover:bg-olive-400 hover:shadow-[0_4px_16px_rgba(139,180,81,0.3)] hover:-translate-y-0.5 transition-all duration-200">Open GitHub Discussions</a></div>
        </StaticSection>
        <StaticSection id="process" title="How We Prioritize">
          <p>We review community feedback weekly. Features that receive the most upvotes and align with our core mission of connecting people offline are prioritized for development.</p>
        </StaticSection>
      </StaticPageContent>
    </div>
  );
}
