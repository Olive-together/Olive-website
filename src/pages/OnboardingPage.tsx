/**
 * OnboardingPage — LetsDoTogether
 * 3-step guided onboarding for new users.
 * Draft state persists to localStorage — survives refreshes.
 * Connects to real backend APIs.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Check,
  Mic,
  MicOff,
  Leaf,
  Sparkles,
  Globe,
  X,
  AlertCircle,
  Upload,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { usersApi } from '@/lib/api/users.api';
import { mediaApi } from '@/lib/api/media.api';
import { onboardingApi } from '@/lib/api/onboarding.api';
import type { InterestItem } from '@/lib/api/onboarding.api';
import { LocationSelector } from '@/components/LocationSelector';
import { useQuery } from '@tanstack/react-query';

// ─── DRAFT PERSISTENCE ───────────────────────────────────────────────────────
const DRAFT_KEY = 'ldt_onboarding_draft_v2';

interface OnboardingDraft {
  step: number;
  displayName: string;
  bio: string;
  intent: string[];
  city: string;
  state: string;
  country: string;
  radiusKm: number;
  discoveryScope: 'local' | 'global';
  interestIds: string[];
  skillNames: string[];
  wantToLearn: string[];
  promptKey: string;
  promptAnswer: string;
  avatarUrl: string | null;
}

const DEFAULT_DRAFT: OnboardingDraft = {
  step: 1,
  displayName: '',
  bio: '',
  intent: [],
  city: '',
  state: '',
  country: '',
  radiusKm: 25,
  discoveryScope: 'local',
  interestIds: [],
  skillNames: [],
  wantToLearn: [],
  promptKey: '',
  promptAnswer: '',
  avatarUrl: null,
};

function loadDraft(): OnboardingDraft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) return { ...DEFAULT_DRAFT, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULT_DRAFT };
}

function saveDraft(patch: Partial<OnboardingDraft>) {
  try {
    const existing = loadDraft();
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...existing, ...patch }));
  } catch { /* ignore */ }
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

// ─── STATIC DATA ─────────────────────────────────────────────────────────────
const INTENT_OPTIONS = [
  { id: 'similar-interests', label: 'Find people with similar interests', emoji: '🎯' },
  { id: 'activity-partners', label: 'Find activity partners', emoji: '🤝' },
  { id: 'learn-something', label: 'Learn something new', emoji: '📚' },
  { id: 'teach-skills', label: 'Teach or share my skills', emoji: '🎓' },
  { id: 'find-nearby', label: 'Find people nearby', emoji: '📍' },
  { id: 'join-communities', label: 'Join communities', emoji: '👥' },
  { id: 'collaborate', label: 'Collaborate on projects', emoji: '🚀' },
  { id: 'explore', label: 'Just explore', emoji: '🌍' },
];

const RADIUS_OPTIONS = [5, 10, 25, 50, 0];
const RADIUS_LABELS: Record<number, string> = {
  5: '5 km', 10: '10 km', 25: '25 km', 50: '50 km', 0: 'Anywhere',
};

const SKILL_SUGGESTIONS = [
  'Guitar', 'Piano', 'Singing', 'Photography', 'Cooking', 'Baking',
  'Yoga', 'Drawing', 'Painting', 'React', 'Python', 'UI Design',
  'Video Editing', 'Public Speaking', 'Writing', 'Skating', 'Swimming',
  'Rock Climbing', 'Chess', 'Pottery',
];

const LEARN_SUGGESTIONS = [
  'Spanish', 'Photography', 'Coding', 'Guitar', 'Yoga', 'Cooking',
  'Dancing', 'Video editing', 'Chess', 'Public speaking', 'Sketching', 'Piano',
];

const PROMPTS = [
  { key: 'talk-hours', label: "Something I could talk about for hours\u2026" },
  { key: 'ideal-weekend', label: "My ideal weekend looks like\u2026" },
  { key: 'currently-learning', label: "Something I\u2019m currently learning\u2026" },
  { key: 'teach-someone', label: "A skill I can teach someone\u2026" },
  { key: 'love-to-try', label: "Something I\u2019d love to try with other people\u2026" },
  { key: 'convince-me', label: "The easiest way to convince me to join an activity is\u2026" },
];

const FALLBACK_INTERESTS: InterestItem[] = [
  { id: 'music', name: 'Music', slug: 'music' },
  { id: 'photography', name: 'Photography', slug: 'photography' },
  { id: 'fitness', name: 'Fitness', slug: 'fitness' },
  { id: 'gaming', name: 'Gaming', slug: 'gaming' },
  { id: 'coding', name: 'Coding', slug: 'coding' },
  { id: 'art', name: 'Art', slug: 'art' },
  { id: 'travel', name: 'Travel', slug: 'travel' },
  { id: 'books', name: 'Books', slug: 'books' },
  { id: 'dance', name: 'Dance', slug: 'dance' },
  { id: 'sports', name: 'Sports', slug: 'sports' },
  { id: 'cooking', name: 'Cooking', slug: 'cooking' },
  { id: 'movies', name: 'Movies', slug: 'movies' },
  { id: 'entrepreneurship', name: 'Entrepreneurship', slug: 'entrepreneurship' },
  { id: 'yoga', name: 'Yoga', slug: 'yoga' },
  { id: 'hiking', name: 'Hiking', slug: 'hiking' },
  { id: 'writing', name: 'Writing', slug: 'writing' },
  { id: 'design', name: 'Design', slug: 'design' },
  { id: 'theatre', name: 'Theatre', slug: 'theatre' },
  { id: 'astronomy', name: 'Astronomy', slug: 'astronomy' },
  { id: 'food', name: 'Food & Dining', slug: 'food-dining' },
];

const INTEREST_EMOJI: Record<string, string> = {
  music: '🎵', photography: '📷', fitness: '💪', gaming: '🎮', coding: '💻',
  art: '🎨', travel: '✈️', books: '📖', dance: '💃', sports: '⚽',
  cooking: '🍳', movies: '🎬', entrepreneurship: '🚀', yoga: '🧘',
  hiking: '🥾', writing: '✍️', design: '✏️', theatre: '🎭',
  astronomy: '🔭', 'food-dining': '🍽️',
};

// ─── CHIP ────────────────────────────────────────────────────────────────────
interface ChipProps {
  label: string;
  emoji?: string;
  selected: boolean;
  onClick: () => void;
}

function Chip({ label, emoji, selected, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'chip-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-sm font-medium',
        'border transition-all duration-200 cursor-pointer select-none',
        selected
          ? 'bg-olive-500 border-olive-500 text-white shadow-sm scale-105'
          : 'bg-white border-olive-200 text-olive-700 hover:border-olive-400 hover:bg-olive-50',
      ].join(' ')}
      aria-pressed={selected}
    >
      {emoji && <span className="text-base leading-none">{emoji}</span>}
      {label}
      {selected && <Check className="w-3.5 h-3.5 ml-0.5 flex-shrink-0" />}
    </button>
  );
}

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <React.Fragment key={i}>
          <div
            className={[
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-400',
              i + 1 < step
                ? 'bg-olive-500 text-white'
                : i + 1 === step
                ? 'bg-olive-500 text-white ring-4 ring-olive-200'
                : 'bg-olive-100 text-olive-400',
            ].join(' ')}
          >
            {i + 1 < step ? <Check className="w-4 h-4" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className="flex-1 h-1 rounded-full overflow-hidden bg-olive-100">
              <div
                className="h-full bg-olive-500 transition-all duration-500 ease-out"
                style={{ width: i + 1 < step ? '100%' : '0%' }}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── AVATAR UPLOADER ─────────────────────────────────────────────────────────
interface AvatarUploaderProps {
  avatarUrl: string | null;
  username: string;
  onUpload: (url: string) => void;
}

function AvatarUploader({ avatarUrl, username, onUpload }: AvatarUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please choose an image file (JPG, PNG, WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be under 5 MB');
      return;
    }
    setUploadError(null);
    setIsUploading(true);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    try {
      const { signature, timestamp, apiKey, cloudName, folder } =
        await mediaApi.getSignature('PROFILE_AVATAR');
      const fd = new FormData();
      fd.append('file', file);
      fd.append('api_key', apiKey);
      fd.append('timestamp', timestamp.toString());
      fd.append('signature', signature);
      fd.append('folder', folder);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: fd }
      );
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();

      await mediaApi.confirmUpload({
        publicId: data.public_id,
        url: data.url,
        secureUrl: data.secure_url,
        entityType: 'PROFILE_AVATAR',
        format: data.format,
        width: data.width,
        height: data.height,
        bytes: data.bytes,
      });

      onUpload(data.secure_url);
      setPreview(data.secure_url);
    } catch {
      setPreview(avatarUrl);
      setUploadError('Upload failed — please try again');
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(objectUrl);
    }
  };

  const fallback = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative group cursor-pointer"
        onClick={() => fileRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload profile photo"
        onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
      >
        <div className="w-28 h-28 rounded-3xl overflow-hidden ring-4 ring-olive-200 transition-all duration-200 group-hover:ring-olive-400 group-hover:scale-105">
          <img src={preview || fallback} alt="Your avatar" className="w-full h-full object-cover" />
        </div>
        <div className={[
          'absolute inset-0 rounded-3xl bg-black/40 flex flex-col items-center justify-center gap-1',
          'transition-opacity duration-200',
          isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        ].join(' ')}>
          {isUploading
            ? <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : (<><Upload className="w-5 h-5 text-white" /><span className="text-white text-xs font-medium">Change</span></>)
          }
        </div>
        <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 bg-olive-500 rounded-full flex items-center justify-center shadow-btn border-2 border-white">
          <Camera className="w-3.5 h-3.5 text-white" />
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
      />
      <p className="text-xs text-olive-400 text-center">Tap to add a photo · JPG, PNG or WebP · max 5 MB</p>
      {uploadError && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> {uploadError}
        </p>
      )}
    </div>
  );
}

// ─── VOICE RECORDER ──────────────────────────────────────────────────────────
function VoiceRecorder({ onRecorded }: { onRecorded: (blob: Blob | null) => void }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [playUrl, setPlayUrl] = useState<string | null>(null);
  const [permDenied, setPermDenied] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const MAX = 20;

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const startRecording = async () => {
    setPermDenied(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const b = new Blob(chunksRef.current, { type: 'audio/webm' });
        setBlob(b);
        const url = URL.createObjectURL(b);
        setPlayUrl(url);
        onRecorded(b);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds((s) => { if (s + 1 >= MAX) stopRecording(); return s + 1; });
      }, 1000);
    } catch { setPermDenied(true); }
  };

  const discard = () => {
    setBlob(null);
    if (playUrl) URL.revokeObjectURL(playUrl);
    setPlayUrl(null);
    onRecorded(null);
    setSeconds(0);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  if (permDenied) {
    return (
      <div className="flex items-center gap-2 text-sm text-olive-500 p-3 bg-olive-50 rounded-xl">
        <MicOff className="w-4 h-4 flex-shrink-0" />
        <span>Microphone access denied. Enable it in your browser settings.</span>
      </div>
    );
  }

  if (blob && playUrl) {
    return (
      <div className="flex items-center gap-3 p-3 bg-olive-50 rounded-2xl border border-olive-200">
        <div className="w-9 h-9 bg-olive-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Mic className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-olive-800">Voice intro recorded ✓</p>
          <audio controls src={playUrl} className="w-full mt-1" style={{ height: '28px' }} />
        </div>
        <button type="button" onClick={discard} className="text-olive-400 hover:text-red-500 transition-colors" aria-label="Discard recording">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={recording ? stopRecording : startRecording}
        className={[
          'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200',
          recording
            ? 'bg-red-500 animate-pulse scale-110 shadow-lg'
            : 'bg-olive-100 hover:bg-olive-200 border-2 border-olive-300',
        ].join(' ')}
        aria-label={recording ? 'Stop recording' : 'Start recording'}
      >
        {recording ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-olive-600" />}
      </button>
      {recording && (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-olive-700">Recording... {seconds}s / {MAX}s</span>
        </div>
      )}
      {!recording && (
        <p className="text-xs text-olive-400 text-center">
          Tap to record a short voice intro (max {MAX}s) · completely optional
        </p>
      )}
    </div>
  );
}

// ─── STEP SLIDE WRAPPER ───────────────────────────────────────────────────────
function StepSlide({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ animation: 'stepSlideIn 0.38s cubic-bezier(0.22,1,0.36,1) both' }}>
      {children}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export function OnboardingPage() {
  const navigate = useNavigate();
  const storeUser = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [draft, setDraftState] = useState<OnboardingDraft>(loadDraft);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [stepKey, setStepKey] = useState(0);

  const { data: availableInterests } = useQuery({
    queryKey: ['onboarding', 'interests'],
    queryFn: onboardingApi.getInterests,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const interests = (availableInterests && availableInterests.length > 0)
    ? availableInterests
    : FALLBACK_INTERESTS;

  const setDraft = useCallback((patch: Partial<OnboardingDraft>) => {
    setDraftState((prev) => {
      const next = { ...prev, ...patch };
      saveDraft(next);
      return next;
    });
  }, []);

  const goToStep = (next: number) => {
    setDraft({ step: next });
    setStepKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggle = <T,>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleFinish = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const selectedInterestNames = interests
        .filter((i) => draft.interestIds.includes(i.id))
        .map((i) => i.name);

      await usersApi.updateMe({
        displayName: draft.displayName || undefined,
        bio: draft.bio || undefined,
        city: draft.city || undefined,
        state: draft.state || undefined,
        country: draft.country || undefined,
        interests: selectedInterestNames.length > 0 ? selectedInterestNames : undefined,
        skills: draft.skillNames.length > 0 ? draft.skillNames : undefined,
      });

      // Try to get GPS coordinates and update location
      if (draft.city) {
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
          );
          await onboardingApi.updateLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            city: draft.city || undefined,
            state: draft.state || undefined,
            country: draft.country || undefined,
          });
        } catch { /* silently skip if location denied */ }
      }

      // Update discovery settings
      try {
        const token = localStorage.getItem('access_token');
        const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
        await fetch(`${base}/api/v1/users/me/discovery`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            discoveryEnabled: true,
            maxDiscoveryDistance: draft.discoveryScope === 'global' ? 9999 : draft.radiusKm,
          }),
        });
      } catch { /* non-critical */ }

      // Refresh auth store user
      try {
        const { default: axiosInst } = await import('@/lib/axios');
        const res = await axiosInst.get('/users/me');
        updateUser(res.data);
      } catch { /* non-critical */ }

      clearDraft();
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Something went wrong. Please try again.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const username = storeUser?.username ?? 'you';

  // ── STEP 1 ────────────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-xs font-bold text-olive-500 uppercase tracking-widest mb-3">Step 1 of 3</p>
        <h1 className="text-3xl font-bold text-olive-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          Let's get to know you
        </h1>
        <p className="text-olive-500">Help people understand who you are and what you're into.</p>
      </div>

      {/* Avatar */}
      <div className="card p-6 text-center">
        <AvatarUploader
          avatarUrl={draft.avatarUrl ?? storeUser?.profile?.avatarUrl ?? null}
          username={username}
          onUpload={(url) => setDraft({ avatarUrl: url })}
        />
      </div>

      {/* Basic info */}
      <div className="card p-6 space-y-5">
        <div>
          <label htmlFor="ob-name" className="block text-sm font-semibold text-olive-800 mb-1.5">Your name</label>
          <input
            id="ob-name"
            type="text"
            placeholder="What should people call you?"
            value={draft.displayName}
            onChange={(e) => setDraft({ displayName: e.target.value })}
            className="input-field"
            maxLength={60}
            autoComplete="name"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-olive-800 mb-1.5">Username</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-olive-400 text-sm font-medium">@</span>
            <input type="text" value={username} readOnly className="input-field pl-8 opacity-60 cursor-not-allowed" />
          </div>
          <p className="text-xs text-olive-400 mt-1">Your username was set during registration</p>
        </div>
        <div>
          <label htmlFor="ob-bio" className="block text-sm font-semibold text-olive-800 mb-1.5">Tell people a little about yourself</label>
          <textarea
            id="ob-bio"
            placeholder="I love exploring new places, making music, and meeting interesting people…"
            value={draft.bio}
            onChange={(e) => setDraft({ bio: e.target.value })}
            rows={3}
            maxLength={500}
            className="input-field resize-none"
          />
          <p className="text-xs text-olive-400 mt-1 text-right">{draft.bio.length}/500</p>
        </div>
      </div>

      {/* Skills + Learn */}
      <div className="card p-6 space-y-6">
        <div>
          <p className="text-sm font-semibold text-olive-800 mb-1">Things you're good at</p>
          <p className="text-xs text-olive-400 mb-3">People can find you as a collaborator or teacher</p>
          <div className="flex flex-wrap gap-2">
            {SKILL_SUGGESTIONS.map((s) => (
              <Chip key={s} label={s} selected={draft.skillNames.includes(s)} onClick={() => setDraft({ skillNames: toggle(draft.skillNames, s) })} />
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-olive-800 mb-1">Things you want to learn</p>
          <p className="text-xs text-olive-400 mb-3">Find others who can help you grow</p>
          <div className="flex flex-wrap gap-2">
            {LEARN_SUGGESTIONS.map((s) => (
              <Chip key={s} label={s} selected={draft.wantToLearn.includes(s)} onClick={() => setDraft({ wantToLearn: toggle(draft.wantToLearn, s) })} />
            ))}
          </div>
        </div>
      </div>

      {/* Intent */}
      <div className="card p-6">
        <p className="text-sm font-semibold text-olive-800 mb-1">What are you looking for?</p>
        <p className="text-xs text-olive-400 mb-4">Pick as many as you like — easy to change later</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {INTENT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setDraft({ intent: toggle(draft.intent, opt.id) })}
              className={[
                'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-left',
                'border transition-all duration-200 cursor-pointer',
                draft.intent.includes(opt.id)
                  ? 'bg-olive-50 border-olive-400 text-olive-800'
                  : 'bg-white border-olive-100 text-olive-600 hover:border-olive-300 hover:bg-olive-50',
              ].join(' ')}
              aria-pressed={draft.intent.includes(opt.id)}
            >
              <span className="text-xl flex-shrink-0">{opt.emoji}</span>
              <span className="flex-1">{opt.label}</span>
              {draft.intent.includes(opt.id) && <Check className="w-4 h-4 text-olive-500 flex-shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => goToStep(2)}
        disabled={!draft.displayName.trim()}
        className="btn-primary w-full py-4 text-base disabled:opacity-50"
      >
        Continue <ChevronRight className="w-5 h-5" />
      </button>
      {!draft.displayName.trim() && (
        <p className="text-center text-xs text-olive-400">Add your name to continue</p>
      )}
    </div>
  );

  // ── STEP 2 ────────────────────────────────────────────────────────────────
  const renderStep2 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-xs font-bold text-olive-500 uppercase tracking-widest mb-3">Step 2 of 3</p>
        <h1 className="text-3xl font-bold text-olive-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          Where do you hang out?
        </h1>
        <p className="text-olive-500">This helps us find activities and people near you.</p>
      </div>

      {/* Location */}
      <div className="card p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-olive-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <MapPin className="w-4 h-4 text-olive-600" />
          </div>
          <div>
            <p className="font-semibold text-olive-800 text-sm">Your base location</p>
            <p className="text-xs text-olive-400 mt-0.5">We only show your city — never your exact address.</p>
          </div>
        </div>

        <LocationSelector
          country={draft.country}
          state={draft.state}
          city={draft.city}
          onChange={(loc) => setDraft({ country: loc.country, state: loc.state, city: loc.city })}
        />

        <button
          type="button"
          onClick={() => {
            navigator.geolocation?.getCurrentPosition(() => {
              if (!draft.city) setDraft({ city: 'Current Location' });
            });
          }}
          className="flex items-center gap-2 text-sm text-olive-500 hover:text-olive-700 transition-colors"
        >
          <Globe className="w-4 h-4" />
          Use my current location (approximate)
        </button>
      </div>

      {/* Radius */}
      <div className="card p-6 space-y-4">
        <p className="font-semibold text-olive-800 text-sm">How far are you willing to go?</p>
        <div className="flex flex-wrap gap-2">
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setDraft({ radiusKm: r, discoveryScope: r === 0 ? 'global' : 'local' })}
              className={[
                'px-4 py-2.5 rounded-2xl text-sm font-semibold border transition-all duration-200',
                draft.radiusKm === r
                  ? 'bg-olive-500 border-olive-500 text-white scale-105'
                  : 'bg-white border-olive-200 text-olive-600 hover:border-olive-400',
              ].join(' ')}
              aria-pressed={draft.radiusKm === r}
            >
              {RADIUS_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div className="card p-6">
        <p className="font-semibold text-olive-800 text-sm mb-1">What are you into?</p>
        <p className="text-xs text-olive-400 mb-4">Pick a few to help us show relevant activities and people</p>
        <div className="flex flex-wrap gap-2">
          {interests.map((interest) => (
            <Chip
              key={interest.id}
              label={interest.name}
              emoji={INTEREST_EMOJI[interest.slug] ?? '⭐'}
              selected={draft.interestIds.includes(interest.id)}
              onClick={() => setDraft({ interestIds: toggle(draft.interestIds, interest.id) })}
            />
          ))}
        </div>
        {draft.interestIds.length > 0 && (
          <p className="text-xs text-olive-500 mt-3 font-medium">{draft.interestIds.length} selected</p>
        )}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={() => goToStep(1)} className="btn-secondary flex-1 py-4">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        <button
          type="button"
          onClick={() => goToStep(3)}
          disabled={draft.interestIds.length < 1}
          className="btn-primary py-4 text-base flex-[2] disabled:opacity-50"
        >
          Continue <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      {draft.interestIds.length < 1 && (
        <p className="text-center text-xs text-olive-400">Select at least one interest to continue</p>
      )}
    </div>
  );

  // ── STEP 3 ────────────────────────────────────────────────────────────────
  const renderStep3 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-xs font-bold text-olive-500 uppercase tracking-widest mb-3">Step 3 of 3</p>
        <h1 className="text-3xl font-bold text-olive-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          Show people your personality
        </h1>
        <p className="text-olive-500">Give people a glimpse of what it's like to know you.</p>
      </div>

      {/* Prompts */}
      <div className="card p-6 space-y-4">
        <p className="font-semibold text-olive-800 text-sm">Choose a prompt to answer</p>
        <p className="text-xs text-olive-400">This shows on your profile — pick whatever feels most you</p>
        <div className="space-y-2">
          {PROMPTS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setDraft({ promptKey: p.key, promptAnswer: '' })}
              className={[
                'w-full text-left px-4 py-3 rounded-2xl text-sm border transition-all duration-200',
                draft.promptKey === p.key
                  ? 'bg-olive-50 border-olive-400 text-olive-800 font-medium'
                  : 'bg-white border-olive-100 text-olive-600 hover:border-olive-300 hover:bg-olive-50',
              ].join(' ')}
              aria-pressed={draft.promptKey === p.key}
            >
              {p.label}
            </button>
          ))}
        </div>
        {draft.promptKey && (
          <div className="mt-4 animate-slide-up">
            <label className="block text-xs font-semibold text-olive-600 mb-2 uppercase tracking-wide">
              {PROMPTS.find((p) => p.key === draft.promptKey)?.label}
            </label>
            <textarea
              placeholder="Write something real here…"
              value={draft.promptAnswer}
              onChange={(e) => setDraft({ promptAnswer: e.target.value })}
              rows={3}
              maxLength={300}
              className="input-field resize-none"
            />
            <p className="text-xs text-olive-400 mt-1 text-right">{draft.promptAnswer.length}/300</p>
          </div>
        )}
      </div>

      {/* Voice */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-olive-500" />
          <p className="font-semibold text-olive-800 text-sm">Voice intro</p>
          <span className="text-xs text-olive-400">(optional)</span>
        </div>
        <p className="text-xs text-olive-400">Introduce yourself in your own voice.</p>
        <VoiceRecorder onRecorded={(_b) => { /* voice stored locally only */ }} />
      </div>

      {/* Preview */}
      <div className="card p-5 flex items-center justify-between">
        <div>
          <p className="font-semibold text-olive-800 text-sm">Preview your profile</p>
          <p className="text-xs text-olive-400 mt-0.5">See how others will see you</p>
        </div>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="text-sm text-olive-500 hover:text-olive-700 font-semibold transition-colors underline underline-offset-2"
        >
          See preview →
        </button>
      </div>

      {submitError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {submitError}
        </div>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={() => goToStep(2)} className="btn-secondary flex-1 py-4">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        <button
          type="button"
          onClick={handleFinish}
          disabled={isSubmitting}
          className="btn-primary flex-[2] py-4 text-base disabled:opacity-50"
        >
          {isSubmitting
            ? (<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Finishing up…</>)
            : (<><Sparkles className="w-5 h-5" /> Finish Profile</>)
          }
        </button>
      </div>
    </div>
  );

  // ── Preview Modal ─────────────────────────────────────────────────────────
  const renderPreviewModal = () => {
    if (!showPreview) return null;
    const selectedInterestNames = interests
      .filter((i) => draft.interestIds.includes(i.id))
      .map((i) => i.name);
    const avatarSrc = draft.avatarUrl ?? storeUser?.profile?.avatarUrl
      ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        role="dialog"
        aria-modal="true"
        aria-label="Profile preview"
        onClick={() => setShowPreview(false)}
      >
        <div className="card w-full max-w-sm p-6 animate-scale-in overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-olive-500 uppercase tracking-widest">Profile preview</span>
            <button type="button" onClick={() => setShowPreview(false)} className="text-olive-400 hover:text-olive-700" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center mb-5">
            <img src={avatarSrc} alt={draft.displayName || username} className="w-20 h-20 rounded-3xl mx-auto mb-3 ring-4 ring-olive-200 object-cover" />
            <h2 className="font-bold text-xl text-olive-900" style={{ fontFamily: 'var(--font-heading)' }}>{draft.displayName || username}</h2>
            {draft.city && (
              <p className="text-sm text-olive-500 flex items-center justify-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {[draft.city, draft.state, draft.country].filter(Boolean).join(', ')}
              </p>
            )}
          </div>

          {draft.bio && (
            <p className="text-sm text-olive-700 text-center italic mb-4 leading-relaxed">"{draft.bio}"</p>
          )}

          {draft.promptKey && draft.promptAnswer && (
            <div className="bg-olive-50 rounded-2xl p-4 mb-4">
              <p className="text-xs font-semibold text-olive-500 mb-1">{PROMPTS.find((p) => p.key === draft.promptKey)?.label}</p>
              <p className="text-sm text-olive-800">{draft.promptAnswer}</p>
            </div>
          )}

          {selectedInterestNames.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-olive-500 mb-2 uppercase tracking-wide">Interests</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedInterestNames.slice(0, 8).map((n) => <span key={n} className="badge-olive">{n}</span>)}
                {selectedInterestNames.length > 8 && <span className="badge-olive">+{selectedInterestNames.length - 8}</span>}
              </div>
            </div>
          )}

          {draft.skillNames.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-olive-500 mb-2 uppercase tracking-wide">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {draft.skillNames.slice(0, 6).map((n) => <span key={n} className="badge-olive">{n}</span>)}
              </div>
            </div>
          )}

          {draft.intent.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-olive-500 mb-2 uppercase tracking-wide">Looking to</p>
              <div className="flex flex-wrap gap-1.5">
                {draft.intent.map((id) => {
                  const opt = INTENT_OPTIONS.find((o) => o.id === id);
                  return opt ? <span key={id} className="badge-olive">{opt.emoji} {opt.label}</span> : null;
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button type="button" onClick={() => setShowPreview(false)} className="btn-secondary flex-1 py-3">Edit</button>
            <button
              type="button"
              onClick={() => { setShowPreview(false); handleFinish(); }}
              disabled={isSubmitting}
              className="btn-primary flex-1 py-3"
            >
              {isSubmitting ? 'Saving…' : 'Looks good!'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes stepSlideIn {
          from { opacity: 0; transform: translateY(18px) scale(0.985); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .chip-btn { touch-action: manipulation; }
        html.dark .chip-btn[aria-pressed="false"] {
          background-color: var(--bg-card-el);
          border-color: var(--border-subtle);
          color: var(--text-secondary);
        }
        html.dark .chip-btn[aria-pressed="false"]:hover {
          border-color: var(--border-accent);
          background-color: var(--bg-hover);
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
        {/* Sticky header */}
        <header
          className="sticky top-0 z-40 border-b"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', backdropFilter: 'blur(12px)' }}
        >
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-xl bg-olive-500 flex items-center justify-center shadow-btn">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-olive-900 text-sm hidden sm:block" style={{ fontFamily: 'var(--font-heading)' }}>
                LetsDoTogether
              </span>
            </div>
            <div className="flex-1 max-w-48">
              <ProgressBar step={draft.step} total={3} />
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Skip onboarding? You can complete your profile later from Settings.')) {
                  clearDraft();
                  navigate('/dashboard');
                }
              }}
              className="text-xs text-olive-400 hover:text-olive-600 transition-colors flex-shrink-0"
            >
              Skip
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="max-w-lg mx-auto px-4 py-8 pb-24">
          <StepSlide key={stepKey}>
            {draft.step === 1 && renderStep1()}
            {draft.step === 2 && renderStep2()}
            {draft.step === 3 && renderStep3()}
          </StepSlide>
        </main>
      </div>

      {renderPreviewModal()}
    </>
  );
}
