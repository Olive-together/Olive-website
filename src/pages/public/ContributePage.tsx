import React from 'react';
import { StaticPageHeader, StaticPageContent } from '@/components/StaticPageHeader';
import { StaticSection } from '@/components/StaticSection';

export function ContributePage() {
  return (
    <div className="animate-fade-in">
      <StaticPageHeader 
        title="Contribute to Olive" 
        subtitle="LetsDoTogether is built in the open. Join our community of contributors."
      />
      <StaticPageContent>
        
        <StaticSection id="code" title="Code Contributions">
          <p>Our stack is React, TypeScript, and Node.js. Check out our GitHub repository to find issues labeled "good first issue" or "help wanted". We welcome pull requests from developers of all skill levels.</p>
        </StaticSection>
        <StaticSection id="non-code" title="Other Ways to Help">
          <p>Not a developer? No problem! You can contribute by translating the app, writing documentation, reporting bugs, or simply by hosting amazing activities in your city and spreading the word.</p>
        </StaticSection>
      </StaticPageContent>
    </div>
  );
}
