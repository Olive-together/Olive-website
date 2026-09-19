import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays, MapPin, Users, ArrowLeft, Share2,
  Bookmark, CheckCircle, Clock, Tag, Star, MessageSquare,
  Trash2, LogOut, AlertTriangle, X,
} from 'lucide-react';
import { activitiesApi } from '@/lib/api/activities.api';
import { adminApi } from '@/lib/api/admin.api';
import { chatApi } from '@/lib/api/chat.api';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import '@/lib/leaflet-init';
import { cn } from '@/lib/cn';
import { getCoverImage } from '@/lib/getImage';
import { useAuthStore } from '@/store/authStore';

function formatDate(iso: string | null | undefined) {
  if (!iso) return 'TBD';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'TBD';
  return d.toLocaleDateString('en-US', {
    weekday: 'short', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}



function getAvatar(avatarUrl: string | null, username: string) {
  return avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
}

// ─── Confirmation Modal ──────────────────────────────────────────────────────
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  confirmClassName?: string;
  isPending?: boolean;
  children?: React.ReactNode;
}

function ConfirmModal({
  isOpen, onClose, onConfirm, title, message, confirmLabel,
  confirmClassName = 'bg-red-500 hover:bg-red-600 text-white',
  isPending, children,
}: ConfirmModalProps) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md animate-fade-in relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-olive-400 hover:text-olive-700 hover:bg-olive-50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center gap-3 mb-5">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-1">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <h3 style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-xl text-olive-900">{title}</h3>
          <p className="text-olive-500 text-sm leading-relaxed">{message}</p>
        </div>

        {children}

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-olive-200 text-olive-600 font-semibold text-sm hover:bg-olive-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={cn('flex-1 py-3 rounded-2xl font-bold text-sm transition-all disabled:opacity-60', confirmClassName)}
          >
            {isPending ? 'Please wait...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.role === 'ADMIN';

  // Modal states
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [showAdminRemoveConfirm, setShowAdminRemoveConfirm] = useState(false);
  const [adminRemoveReason, setAdminRemoveReason] = useState('');

  const { data: activity, isLoading, isError } = useQuery({
    queryKey: ['activities', id],
    queryFn: () => activitiesApi.getById(id!),
    enabled: !!id,
  });

  const { data: participants = [] } = useQuery({
    queryKey: ['activities', id, 'participants'],
    queryFn: () => activitiesApi.getParticipants(id!),
    enabled: !!id,
  });

  const [joined, setJoined] = useState(false);
  // Sync joined state from participants list (most reliable) or activity.isJoined
  useEffect(() => {
    if (!currentUser) return;
    const inParticipants = participants.some(
      (p: any) => p.id === currentUser.id || p.userId === currentUser.id
    );
    if (inParticipants) {
      setJoined(true);
    } else if (activity?.isJoined !== undefined) {
      setJoined(activity.isJoined);
    }
  }, [participants, activity, currentUser]);

  // Determine if current user is the host
  const host = (activity as any)?.creator || activity?.host;
  const isHost = !!currentUser && !!host &&
    (host.id === currentUser.id || host.username === currentUser.username);

  // ── Join mutation ──────────────────────────────────────────────────────────
  const joinMutation = useMutation({
    mutationFn: () => activitiesApi.join(id!),
    onSuccess: () => {
      setJoined(true);
      queryClient.invalidateQueries({ queryKey: ['activities', id] });
      queryClient.invalidateQueries({ queryKey: ['activities', id, 'participants'] });
    },
  });

  // ── Leave mutation ─────────────────────────────────────────────────────────
  const leaveMutation = useMutation({
    mutationFn: () => activitiesApi.leave(id!),
    onSuccess: () => {
      setJoined(false);
      setShowLeaveConfirm(false);
      queryClient.invalidateQueries({ queryKey: ['activities', id] });
      queryClient.invalidateQueries({ queryKey: ['activities', id, 'participants'] });
    },
  });

  // ── Host delete mutation ───────────────────────────────────────────────────
  const hostDeleteMutation = useMutation({
    mutationFn: (msg: string) => activitiesApi.delete(id!, msg || undefined),
    onSuccess: () => {
      setShowDeleteConfirm(false);
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      navigate('/activities', { replace: true });
    },
    onError: () => {
      window.alert('Unable to delete this activity. Please try again.');
    },
  });

  // ── Admin remove mutation ──────────────────────────────────────────────────
  const adminRemoveMutation = useMutation({
    mutationFn: (reason: string) => adminApi.deleteActivity(id!, reason),
    onSuccess: () => {
      setShowAdminRemoveConfirm(false);
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['admin-activities'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      navigate('/admin', { replace: true });
    },
    onError: () => {
      window.alert('Unable to remove this activity. Please try again from the admin dashboard.');
    },
  });

  const openGroupChat = async () => {
    try {
      // Use the conv id from the activity response if available, otherwise fetch it
      const convId = (activity as any)?.groupConversation?.id;
      if (convId) {
        navigate('/messages', { state: { conversationId: convId } });
      } else {
        const conv = await chatApi.getActivityChat(id!);
        navigate('/messages', { state: { conversationId: conv.id } });
      }
    } catch {
      // Fallback: navigate to messages and let user select
      navigate('/messages');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 max-w-5xl mx-auto w-full p-6 animate-fade-in">
        <div className="h-64 rounded-3xl bg-olive-100 animate-pulse mb-6" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-32 animate-pulse bg-olive-50" />)}
          </div>
          <div className="card h-64 animate-pulse bg-olive-50" />
        </div>
      </div>
    );
  }

  if (isError || !activity) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-8">
        <div>
          <div className="text-6xl mb-4">🌿</div>
          <h3 style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-xl text-olive-900 mb-2">Activity not found</h3>
          <Link to="/activities" className="btn-primary text-sm mt-4">Browse Activities</Link>
        </div>
      </div>
    );
  }

  const attendees = activity._count?.participants ?? 0;
  const capacity = activity.maxParticipants;
  const fillPercent = capacity > 0 ? Math.min(Math.round((attendees / capacity) * 100), 100) : 0;
  const hostName = host?.profile?.displayName ?? host?.username;
  const hostAvatar = getAvatar(host?.profile?.avatarUrl ?? null, host?.username ?? '');

  const startTime = activity.scheduledAt ?? activity.startTime;
  const endTime = activity.endsAt ?? activity.endTime;

  // Determine if the activity is past — either status says so, or scheduled time has passed
  const isPast =
    activity.status === 'COMPLETED' ||
    activity.status === 'EXPIRED' ||
    (!!startTime && new Date(startTime) < new Date());

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full animate-fade-in">
      {/* ── Leave Confirmation Modal ─────────────────────────────────────── */}
      <ConfirmModal
        isOpen={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={() => leaveMutation.mutate()}
        title="Leave Activity?"
        message={`Are you sure you want to leave "${activity.title}"? You can always rejoin if there are spots available.`}
        confirmLabel="Yes, Leave"
        isPending={leaveMutation.isPending}
      />

      {/* ── Host Delete Confirmation Modal ───────────────────────────────── */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setDeleteMessage(''); }}
        onConfirm={() => hostDeleteMutation.mutate(deleteMessage)}
        title="Delete Activity?"
        message={`This will permanently cancel "${activity.title}" and notify all participants. This action cannot be undone.`}
        confirmLabel="Delete & Notify"
        isPending={hostDeleteMutation.isPending}
      >
        <div className="mt-1">
          <label className="block text-xs font-semibold text-olive-600 mb-1.5 text-left">
            Message to participants <span className="text-olive-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={deleteMessage}
            onChange={(e) => setDeleteMessage(e.target.value)}
            placeholder="e.g. Unfortunately I need to cancel due to a scheduling conflict. Thanks for your interest!"
            rows={3}
            className="w-full px-4 py-3 rounded-2xl border border-olive-200 text-sm text-olive-800 placeholder-olive-300 focus:outline-none focus:ring-2 focus:ring-olive-400 resize-none"
          />
        </div>
      </ConfirmModal>

      {/* ── Admin Remove Confirmation Modal ──────────────────────────────── */}
      <ConfirmModal
        isOpen={showAdminRemoveConfirm}
        onClose={() => { setShowAdminRemoveConfirm(false); setAdminRemoveReason(''); }}
        onConfirm={() => adminRemoveMutation.mutate(adminRemoveReason)}
        title="Remove Activity?"
        message={`As an admin, removing "${activity.title}" will notify the host. Please provide a reason.`}
        confirmLabel="Remove Activity"
        isPending={adminRemoveMutation.isPending}
      >
        <div className="mt-1">
          <label className="block text-xs font-semibold text-olive-600 mb-1.5 text-left">
            Reason for removal <span className="text-red-400">*</span>
          </label>
          <textarea
            value={adminRemoveReason}
            onChange={(e) => setAdminRemoveReason(e.target.value)}
            placeholder="e.g. Violates community guidelines..."
            rows={3}
            className="w-full px-4 py-3 rounded-2xl border border-olive-200 text-sm text-olive-800 placeholder-olive-300 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
          />
        </div>
      </ConfirmModal>
      {/* Back */}
      <div className="p-4 sm:p-6">
        <Link to="/activities" className="inline-flex items-center gap-2 text-sm text-olive-600 hover:text-olive-800 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Activities
        </Link>
      </div>

      {/* Hero image */}
      <div className="relative h-56 sm:h-80 overflow-hidden mx-4 sm:mx-6 rounded-3xl mb-6">
        <img src={getCoverImage(activity.coverImageUrl, activity.category)} alt={activity.title} className={cn('w-full h-full object-cover', isPast && 'grayscale-[40%]')} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {isPast && (
          <div className="absolute inset-0 bg-black/20" />
        )}
        <div className="absolute bottom-5 left-5">
          <span className="badge bg-white/90 text-olive-700 mb-2">{activity.category}</span>
          {isPast && (
            <span className="badge bg-gray-700/90 text-white mb-2 ml-2">Past Activity</span>
          )}
          <h1 style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-3xl text-white">{activity.title}</h1>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={() => setSaved(!saved)} className="w-9 h-9 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
            <Bookmark className={cn('w-4 h-4', saved ? 'fill-olive-500 text-olive-500' : 'text-olive-600')} />
          </button>
          <button className="w-9 h-9 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
            <Share2 className="w-4 h-4 text-olive-600" />
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 pb-8 grid lg:grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info chips */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-olive-100 shadow-card">
              <CalendarDays className="w-4 h-4 text-olive-500" />
              <span className="text-sm text-olive-700 font-medium">{startTime ? formatDate(startTime) : 'TBD'}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-olive-100 shadow-card">
              <MapPin className="w-4 h-4 text-olive-500" />
              <span className="text-sm text-olive-700 font-medium">{activity.address}, {activity.city}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-olive-100 shadow-card">
              <Users className="w-4 h-4 text-olive-500" />
              <span className="text-sm text-olive-700 font-medium">{attendees}/{capacity} attending</span>
            </div>
            {endTime && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-olive-100 shadow-card">
                <Clock className="w-4 h-4 text-olive-500" />
                <span className="text-sm text-olive-700 font-medium">Ends {formatDate(endTime)}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="card p-6">
            <h2 style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-lg text-olive-900 mb-3">About this Activity</h2>
            <p className="text-olive-600 leading-relaxed">{activity.description}</p>
          </div>

          {/* Location Map — links to Google Maps if coordinates were pinned */}
          {(activity as any).latitude && (activity as any).longitude ? (
            <div className="card p-6">
              <h2 style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-lg text-olive-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-olive-500" /> Location
              </h2>
              {/* Static map preview via Google Maps Embed (no API key needed for static view) */}
              <div className="relative overflow-hidden rounded-2xl border border-olive-100 shadow-card h-48 mb-3 z-0">
                <MapContainer 
                  center={[(activity as any).latitude, (activity as any).longitude]} 
                  zoom={15} 
                  scrollWheelZoom={false} 
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[(activity as any).latitude, (activity as any).longitude]} />
                </MapContainer>
              </div>
              <a
                href={`https://www.google.com/maps?q=${(activity as any).latitude},${(activity as any).longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 w-full rounded-xl bg-olive-50 border border-olive-100 text-olive-700 font-medium text-sm hover:bg-olive-100 transition-colors group"
              >
                <MapPin className="w-4 h-4 text-olive-500" />
                Open in Google Maps ↗
              </a>
              <p className="text-sm text-olive-500 mt-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-olive-400" />
                {activity.address}{activity.city ? `, ${activity.city}` : ''}
              </p>
            </div>
          ) : activity.address ? (
            /* Fallback: no coordinates, but show a text link to search address on Maps */
            <div className="card p-6">
              <h2 style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-lg text-olive-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-olive-500" /> Location
              </h2>
              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent(`${activity.address} ${activity.city ?? ''}`.trim())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-olive-50 border border-olive-100 text-olive-700 font-medium text-sm hover:bg-olive-100 transition-colors group"
              >
                <MapPin className="w-4 h-4 text-olive-500" />
                {activity.address}{activity.city ? `, ${activity.city}` : ''}
                <span className="text-olive-400 group-hover:text-olive-600 transition-colors">↗ Open in Google Maps</span>
              </a>
            </div>
          ) : null}

          {/* Tags */}
          {activity.tags.length > 0 && (
            <div className="card p-6">
              <h2 style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-lg text-olive-900 mb-3 flex items-center gap-2"><Tag className="w-4 h-4" /> Tags</h2>
              <div className="flex flex-wrap gap-2">
                {activity.tags.map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Attendees preview */}
          {participants.length > 0 && (
            <div className="card p-6">
              <h2 style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-lg text-olive-900 mb-4 flex items-center gap-2"><Users className="w-4 h-4" /> Who's going</h2>
              <div className="flex flex-wrap gap-3">
                {participants.slice(0, 6).map((person) => (
                  <Link key={person.id} to={`/people/${person.username}`} className="flex flex-col items-center gap-1.5 group">
                    <img
                      src={person.profile?.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${person.username}`}
                      alt={person.profile?.displayName ?? person.username}
                      className="w-12 h-12 rounded-full ring-2 ring-olive-100 group-hover:ring-olive-400 transition-all"
                    />
                    <span className="text-xs text-olive-600 font-medium">{(person.profile?.displayName ?? person.username).split(' ')[0]}</span>
                  </Link>
                ))}
                {attendees > 6 && (
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-12 h-12 rounded-full bg-olive-100 flex items-center justify-center border-2 border-dashed border-olive-300">
                      <span className="text-xs font-bold text-olive-600">+{attendees - 6}</span>
                    </div>
                    <span className="text-xs text-olive-500">more</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Action card */}
        <div className="space-y-4">
          <div className="card p-6 sticky top-4">
            {/* Host */}
            <div className="flex items-center gap-3 mb-5">
              <img src={hostAvatar} alt={hostName} className="w-12 h-12 rounded-full ring-2 ring-olive-200" />
              <div>
                <p className="text-xs text-olive-500">Hosted by</p>
                <p style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-olive-900">{hostName}</p>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs text-olive-500">Verified host</span>
                </div>
              </div>
            </div>

            <div className="bg-olive-50 rounded-2xl p-4 mb-5">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-olive-600">{attendees} attending</span>
                <span className="text-olive-600 font-medium">{fillPercent}% full</span>
              </div>
              <div className="h-2 bg-olive-200 rounded-full overflow-hidden">
                <div className={cn('h-full rounded-full transition-all duration-500', fillPercent > 80 ? 'bg-amber-400' : 'bg-olive-500')} style={{ width: `${fillPercent}%` }} />
              </div>
              <p className="text-xs text-olive-500 mt-2">{capacity - attendees} spots remaining</p>
            </div>

            <div className="flex items-center justify-between mb-5">
              <span style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-lg text-olive-900">
                {activity.isFree !== false ? '🟢 Free' : `₹${activity.price}`}
              </span>
            </div>

            {/* ── Join / Leave / Host / Past indicator ─────────────────── */}
            {isPast ? (
              /* Activity is over — show status, keep group chat for joined users */
              <div className="space-y-3">
                <div className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gray-100 border border-gray-200 text-gray-500 font-bold text-base" style={{ fontFamily: 'var(--font-poppins)' }}>
                  <Clock className="w-5 h-5" />
                  This Activity Has Ended
                </div>
                {joined && (
                  <p className="text-xs text-olive-400 text-center">You attended this activity. The group chat is still accessible above.</p>
                )}
              </div>
            ) : isHost ? (
              <div className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 font-bold text-base" style={{ fontFamily: 'var(--font-poppins)' }}>
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                You're the Host
              </div>
            ) : joined ? (
              <button
                id="leave-activity-btn"
                onClick={() => setShowLeaveConfirm(true)}
                disabled={leaveMutation.isPending}
                className="w-full group flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all duration-200 disabled:opacity-60 bg-olive-100 text-olive-700 hover:bg-red-50 hover:text-red-600 border border-olive-200 hover:border-red-200"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                <CheckCircle className="w-5 h-5 group-hover:hidden" />
                <LogOut className="w-5 h-5 hidden group-hover:block" />
                <span className="group-hover:hidden">You're Going! ✓</span>
                <span className="hidden group-hover:inline">Leave Activity</span>
              </button>
            ) : (
              <button
                id="join-activity-btn"
                onClick={() => joinMutation.mutate()}
                disabled={joinMutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all duration-200 disabled:opacity-60 bg-olive-500 text-white hover:bg-olive-600 shadow-btn"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                {joinMutation.isPending ? 'Joining...' : 'Join Activity'}
              </button>
            )}

            {/* Group Chat button — only shown to participants (not host, they're always in) */}
            {(joined || isHost) && (
              <button
                onClick={openGroupChat}
                className="w-full mt-3 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-olive-50 border border-olive-200 text-olive-700 font-semibold text-sm hover:bg-olive-100 transition-all duration-200 group"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                <MessageSquare className="w-4 h-4 text-olive-500 group-hover:text-olive-700 transition-colors" />
                Group Chat
              </button>
            )}

            <button className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-2xl border border-olive-200 text-olive-600 font-medium text-sm hover:bg-olive-50 transition-colors">
              <Share2 className="w-4 h-4" /> Share with Friends
            </button>

            {/* ── Host: Delete Activity ────────────────────────────────────── */}
            {isHost && (
              <div className="mt-5 pt-5 border-t border-red-100">
                <p className="text-xs font-semibold uppercase tracking-wide text-red-400 mb-2">Host Controls</p>
                <button
                  id="delete-activity-btn"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={hostDeleteMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors disabled:opacity-60"
                >
                  <Trash2 className="w-4 h-4" />
                  {hostDeleteMutation.isPending ? 'Deleting...' : 'Delete Activity'}
                </button>
              </div>
            )}

            {/* ── Admin: Remove Activity ───────────────────────────────────── */}
            {isAdmin && !isHost && (
              <div className="mt-5 pt-5 border-t border-red-100">
                <p className="text-xs font-semibold uppercase tracking-wide text-red-500 mb-2">Admin control</p>
                <button
                  id="admin-remove-activity-btn"
                  onClick={() => setShowAdminRemoveConfirm(true)}
                  disabled={adminRemoveMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors disabled:opacity-60"
                >
                  <Trash2 className="w-4 h-4" />
                  {adminRemoveMutation.isPending ? 'Removing...' : 'Remove Activity and Notify Owner'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
