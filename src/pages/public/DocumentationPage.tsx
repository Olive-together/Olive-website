import React from 'react';
import { StaticPageHeader, StaticPageContent } from '@/components/StaticPageHeader';
import { StaticSection } from '@/components/StaticSection';

export function DocumentationPage() {
  return (
    <div className="animate-fade-in">
      <StaticPageHeader 
        title="Documentation" 
        subtitle="Technical guides and resources for developers and contributors."
      />
      <StaticPageContent>
        
        <StaticSection id="getting-started" title="Getting Started">
          <p>To run the project locally, clone the repository, install dependencies using `npm install`, and start the development server with `npm run dev`. See our README for full setup instructions.</p>
        </StaticSection>
        <StaticSection id="architecture" title="Architecture Overview">
          <p>The platform uses a monolithic backend built with NestJS and Prisma, communicating with a React frontend via REST and WebSockets for real-time chat.</p>
        </StaticSection>
      </StaticPageContent>
    </div>
  );
}
