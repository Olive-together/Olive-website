import React from 'react';
import { StaticPageHeader, StaticPageContent } from '@/components/StaticPageHeader';
import { StaticSection } from '@/components/StaticSection';

export function PrivacyPage() {
  return (
    <div className="animate-fade-in">
      <StaticPageHeader 
        title="Privacy Policy" 
        subtitle="How we collect, use, and protect your personal information."
      />
      <StaticPageContent>
        
        <StaticSection id="policy" title="Privacy Policy">
          <p>We are committed to protecting your privacy. We only collect information necessary to provide our service, such as your basic profile details and location to show nearby activities.</p>
        </StaticSection>
        <StaticSection id="data" title="Data Usage">
          <p>Your data is never sold to third parties. We use it strictly to improve your experience, match you with relevant activities, and ensure platform safety.</p>
        </StaticSection>
        <StaticSection id="deletion" title="Account and Data Deletion">
          <p>You have the right to be forgotten. You can permanently delete your account and all associated data at any time from your account settings.</p>
        </StaticSection>
        <StaticSection id="cookies" title="Cookies Section">
          <p>We use essential cookies to keep you logged in and securely authenticate your session. We do not use third-party tracking or advertising cookies.</p>
        </StaticSection>
      </StaticPageContent>
    </div>
  );
}
