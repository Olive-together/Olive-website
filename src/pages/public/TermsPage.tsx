import React from 'react';
import { StaticPageHeader, StaticPageContent } from '@/components/StaticPageHeader';
import { StaticSection } from '@/components/StaticSection';

export function TermsPage() {
  return (
    <div className="animate-fade-in">
      <StaticPageHeader 
        title="Terms of Service" 
        subtitle="The rules governing your use of LetsDoTogether."
      />
      <StaticPageContent>
        
        <StaticSection id="acceptance" title="Acceptance of Terms">
          <p>By creating an account, you agree to abide by these Terms of Service and our Community Guidelines. If you do not agree, you may not use the platform.</p>
        </StaticSection>
        <StaticSection id="liability" title="Limitation of Liability">
          <p>LetsDoTogether is a platform to facilitate real-world connections. We are not responsible for the conduct of users offline. Always exercise caution and common sense when meeting people from the internet.</p>
        </StaticSection>
        <StaticSection id="termination" title="Account Termination">
          <p>We reserve the right to suspend or terminate accounts that violate our terms or community guidelines without prior notice.</p>
        </StaticSection>
      </StaticPageContent>
    </div>
  );
}
