/**
 * useShare – copies a sharable app URL to the clipboard and shows a brief
 * in-page toast.  Falls back to the Web Share API on mobile if available.
 *
 * Usage:
 *   const share = useShare();
 *   share({ type: 'activity', id: activity.id });
 *   share({ type: 'profile', username: user.username });
 */

import { useCallback, useRef } from 'react';

type ShareTarget =
  | { type: 'activity'; id: string; title?: string }
  | { type: 'profile'; username: string; displayName?: string };

function buildUrl(target: ShareTarget): string {
  const origin = window.location.origin;
  if (target.type === 'activity') return `${origin}/activities/${target.id}`;
  return `${origin}/people/${target.username}`;
}

function buildText(target: ShareTarget): string {
  if (target.type === 'activity') {
    return `Check out "${target.title ?? 'this activity'}" on Olive! 🌿`;
  }
  return `Check out ${target.displayName ?? target.username}'s profile on Olive! 🌿`;
}

// ── Tiny toast renderer (no external deps) ────────────────────────────────────
let toastTimeout: ReturnType<typeof setTimeout> | null = null;

function showToast(message: string, type: 'success' | 'error' = 'success') {
  // Remove existing toast if any
  document.querySelector('#olive-share-toast')?.remove();
  if (toastTimeout) clearTimeout(toastTimeout);

  const toast = document.createElement('div');
  toast.id = 'olive-share-toast';

  const bgColor = type === 'success' ? '#4a7c59' : '#dc2626';
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(80px);
    background: ${bgColor};
    color: #fff;
    padding: 10px 20px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Poppins', 'Inter', sans-serif;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    z-index: 99999;
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease;
    opacity: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
    pointer-events: none;
  `;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : '✕'}</span><span>${message}</span>`;
  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(-50%) translateY(0)';
      toast.style.opacity = '1';
    });
  });

  // Animate out and remove
  toastTimeout = setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(80px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 350);
  }, 2800);
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useShare() {
  const sharingRef = useRef(false);

  const share = useCallback(async (target: ShareTarget) => {
    if (sharingRef.current) return;
    sharingRef.current = true;

    const url = buildUrl(target);
    const text = buildText(target);

    try {
      // Prefer native Web Share API (mobile browsers)
      if (navigator.share) {
        await navigator.share({ title: 'Olive 🌿', text, url });
        showToast('Shared successfully!');
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(url);
        showToast('Link copied to clipboard!');
      }
    } catch (err: unknown) {
      // User cancelled native share — not an error
      if (err instanceof Error && err.name === 'AbortError') {
        // do nothing
      } else {
        // clipboard API unavailable? Try execCommand
        try {
          const el = document.createElement('textarea');
          el.value = url;
          el.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
          document.body.appendChild(el);
          el.focus();
          el.select();
          document.execCommand('copy');
          el.remove();
          showToast('Link copied to clipboard!');
        } catch {
          showToast('Could not copy link', 'error');
        }
      }
    } finally {
      setTimeout(() => { sharingRef.current = false; }, 1000);
    }
  }, []);

  return share;
}
