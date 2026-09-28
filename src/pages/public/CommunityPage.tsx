import React from 'react';
import { StaticPageHeader, StaticPageContent } from '@/components/StaticPageHeader';
import { StaticSection } from '@/components/StaticSection';

export function CommunityPage() {
  return (
    <div className="animate-fade-in">
      <StaticPageHeader 
        title="Community Standards" 
        subtitle="Our guidelines for building a safe, inclusive, and welcoming environment for everyone."
      />
      <StaticPageContent>
        
        <StaticSection id="guidelines" title="Community Guidelines">
          <p>We believe in mutual respect. Be kind, inclusive, and considerate of others. Harassment, discrimination, or hate speech of any kind will result in immediate account termination.</p>
        </StaticSection>
        <StaticSection id="safety" title="Safety First">
          <p>Your safety is our top priority. We recommend meeting in public places for the first time. Trust your instincts and never feel obligated to share personal information like your home address or financial details.</p>
        </StaticSection>
        <StaticSection id="reporting" title="Reporting & Blocking">
          <p>If someone makes you uncomfortable, you can easily block them from their profile page. To report a serious violation of our guidelines, use the Report button or contact our support team directly. We review all reports promptly.</p>
        </StaticSection>
        <StaticSection id="respect" title="Respectful Behavior">
          <p>Show up when you say you will. If you need to cancel, let the host know as early as possible. Respect everyone&apos;s time and effort.</p>
        </StaticSection>
      </StaticPageContent>
    </div>
  );
}
