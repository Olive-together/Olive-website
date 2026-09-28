import React from 'react';

export function StaticPageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="bg-olive-950 text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
      <div className="absolute top-0 right-0 w-96 h-96 bg-olive-500/20 blur-[100px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
      
      <div className="max-w-4xl mx-auto relative z-10 text-center animate-slide-up">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-wide text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-olive-100/90 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export function StaticPageContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-olive-800 space-y-6 text-lg leading-relaxed">
        {children}
      </div>
    </div>
  );
}
