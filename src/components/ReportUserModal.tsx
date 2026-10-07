import { useState, useRef, useEffect } from 'react';
import { X, Flag, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api/reports.api';

interface ReportUserModalProps {
  userId: string;
  displayName: string;
  onClose: () => void;
}

type ModalState = 'form' | 'submitting' | 'success' | 'error';

export function ReportUserModal({ userId, displayName, onClose }: ReportUserModalProps) {
  const [reason, setReason] = useState('');
  const [modalState, setModalState] = useState<ModalState>('form');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus textarea when modal opens
    const t = setTimeout(() => textareaRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // Close on Escape
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalState !== 'submitting') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [modalState, onClose]);

  const mutation = useMutation({
    mutationFn: () =>
      reportsApi.submit({
        type: 'USER',
        description: reason.trim(),
        targetUserId: userId,
      }),
    onMutate: () => setModalState('submitting'),
    onSuccess: () => setModalState('success'),
    onError: () => setModalState('error'),
  });

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current && modalState !== 'submitting') {
      onClose();
    }
  };

  const canSubmit = reason.trim().length >= 10 && modalState === 'form';

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      aria-modal="true"
      role="dialog"
      aria-label="Report user"
    >
      <div
        className="relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          animation: 'reportModalIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >
        {/* Header */}
        <div
          className="px-6 pt-6 pb-4"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(239,68,68,0.10)' }}
              >
                <Flag className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2
                  className="font-bold text-lg leading-tight"
                  style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
                >
                  Report this user
                </h2>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {displayName}
                </p>
              </div>
            </div>
            {modalState !== 'submitting' && (
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
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {modalState === 'success' ? (
            <div className="flex flex-col items-center text-center py-4 animate-scale-in">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'rgba(74,222,128,0.12)' }}
              >
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3
                className="font-bold text-lg mb-2"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
              >
                Report submitted
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Thanks for helping keep LetsDoTogether safe. Our team will review this report.
              </p>
              <button
                onClick={onClose}
                className="mt-5 btn-primary text-sm py-2.5 px-6"
              >
                Done
              </button>
            </div>
          ) : modalState === 'error' ? (
            <div className="flex flex-col items-center text-center py-4 animate-scale-in">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'rgba(239,68,68,0.10)' }}
              >
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3
                className="font-bold text-lg mb-2"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
              >
                Something went wrong
              </h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-muted)' }}>
                We couldn't submit your report. Please try again.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="btn-secondary text-sm py-2.5 px-5"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setModalState('form')}
                  className="btn-primary text-sm py-2.5 px-5"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : (
            <>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                What's the reason for reporting this person?
              </label>
              <textarea
                ref={textareaRef}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe the issue in your own words…"
                maxLength={2000}
                rows={5}
                className="w-full resize-none text-sm rounded-2xl px-4 py-3 outline-none transition-shadow"
                style={{
                  background: 'var(--bg-input)',
                  border: '1.5px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  boxShadow: 'none',
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = 'var(--accent)')
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = 'var(--border-subtle)')
                }
                disabled={modalState === 'submitting'}
              />
              <div className="flex items-center justify-between mt-1 mb-5">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {reason.trim().length < 10 && reason.length > 0
                    ? 'Please add a bit more detail'
                    : 'Your identity will not be shared with the reported user.'}
                </p>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {reason.length}/2000
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 btn-secondary text-sm py-2.5"
                  disabled={modalState === 'submitting'}
                >
                  Cancel
                </button>
                <button
                  onClick={() => mutation.mutate()}
                  disabled={!canSubmit}
                  className="flex-1 text-sm py-2.5 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2"
                  style={{
                    background: canSubmit ? '#dc2626' : 'var(--bg-hover)',
                    color: canSubmit ? '#fff' : 'var(--text-muted)',
                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                    boxShadow: canSubmit ? '0 3px 12px rgba(220,38,38,0.30)' : 'none',
                  }}
                >
                  {modalState === 'submitting' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    'Submit Report'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes reportModalIn {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
