import React from 'react';
import { StaticPageHeader, StaticPageContent } from '@/components/StaticPageHeader';
import { StaticSection } from '@/components/StaticSection';

export function SecurityPage() {
  return (
    <div className="animate-fade-in">
      <StaticPageHeader 
        title="Security" 
        subtitle="Our approach to keeping the platform and your data secure."
      />
      <StaticPageContent>
        
        <StaticSection id="practices" title="Security Practices">
          <p>All traffic is encrypted via HTTPS. We use industry-standard hashing for passwords and secure token-based authentication. Our databases are regularly backed up and access is strictly controlled.</p>
        </StaticSection>
        <StaticSection id="vulnerabilities" title="Vulnerability Reporting">
          <p>If you believe you have found a security vulnerability in our platform, please do not disclose it publicly. Email us directly at security@letsdotogether.com.</p>
        </StaticSection>
        <StaticSection id="disclosure" title="Responsible Disclosure">
          <p>We will acknowledge your report within 48 hours and work with you to resolve the issue as quickly as possible. We appreciate the efforts of the security community in keeping our users safe.</p>
        </StaticSection>
      </StaticPageContent>
    </div>
  );
}
