import { useRef, useEffect } from 'react';
import { X, ShieldOff, Loader2 } from 'lucide-react';

interface BlockConfirmModalProps {
  displayName: string;
  isBlocked: boolean;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function BlockConfirmModal({
  displayName,
  isBlocked,
  isPending,
  onConfirm,
  onClose,
}: BlockConfirmModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isPending, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current && !isPending) onClose();
  };

  const action = isBlocked ? 'unblock' : 'block';
  const actionLabel = isBlocked ? 'Unblock' : 'Block';

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      aria-modal="true"
      role="dialog"
      aria-label={`${actionLabel} user`}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          animation: 'blockModalIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: isBlocked ? 'rgba(74,222,128,0.10)' : 'rgba(239,68,68,0.10)',
            }}
          >
            <ShieldOff
              className={`w-5 h-5 ${isBlocked ? 'text-green-500' : 'text-red-500'}`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2
              className="font-bold text-lg leading-tight"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              {isBlocked ? 'Unblock' : 'Block'} {displayName}?
            </h2>
          </div>
          {!isPending && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
            {isBlocked
              ? `You will be able to see ${displayName}'s profile and activity again. They will not be notified.`
              : `${displayName} will no longer appear in your People, Search, or recommendations. They will not be notified.`}
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isPending}
              className="flex-1 btn-secondary text-sm py-2.5 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isPending}
              className="flex-1 text-sm py-2.5 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              style={{
                background: isBlocked ? 'var(--accent)' : '#dc2626',
                color: '#fff',
                boxShadow: isBlocked
                  ? '0 3px 12px rgba(111,154,53,0.30)'
                  : '0 3px 12px rgba(220,38,38,0.30)',
              }}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isBlocked ? 'Unblocking…' : 'Blocking…'}
                </>
              ) : (
                `${actionLabel} user`
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blockModalIn {
          from { opacity: 0; transform: scale(0.94) translateY(6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
