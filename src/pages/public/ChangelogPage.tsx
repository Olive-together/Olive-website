import React from 'react';
import { StaticPageHeader, StaticPageContent } from '@/components/StaticPageHeader';
import { StaticSection } from '@/components/StaticSection';

export function ChangelogPage() {
  return (
    <div className="animate-fade-in">
      <StaticPageHeader 
        title="Changelog" 
        subtitle="Keep track of the latest updates, fixes, and improvements."
      />
      <StaticPageContent>
        
        <StaticSection id="latest" title="v1.4.0 - September 2026">
          <ul className="list-disc pl-5 space-y-2"><li><strong>New:</strong> Completely redesigned public architecture and footer.</li><li><strong>New:</strong> Independent scroll regions for messages page.</li><li><strong>Fixed:</strong> Map rendering bugs on mobile devices.</li></ul>
        </StaticSection>
        <StaticSection id="previous" title="v1.3.2 - August 2026">
          <ul className="list-disc pl-5 space-y-2"><li><strong>Improved:</strong> Activity feed performance and infinite scrolling.</li><li><strong>Fixed:</strong> Real-time chat connection drops on spotty networks.</li></ul>
        </StaticSection>
      </StaticPageContent>
    </div>
  );
}
