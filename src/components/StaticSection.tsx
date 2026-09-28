import React from 'react';

export function StaticSection({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 mb-12">
      <h2 
        className="text-2xl font-semibold tracking-wide text-olive-900 mb-6 pb-2 border-b border-olive-200"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {title}
      </h2>
      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}
