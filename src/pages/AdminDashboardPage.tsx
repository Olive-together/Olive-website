import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, Trash2, MessageSquare, RefreshCw,
  Users, MapPin, Calendar, Tag, ChevronLeft,
  ChevronRight, Activity, AlertTriangle, X,
  CheckCircle, Clock, XCircle, Filter,
  Eye, Loader2, Send, ShieldCheck,
} from 'lucide-react';
import { adminApi, type AdminActivity } from '@/lib/api/admin.api';

// ── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  ACTIVE:    { label: 'Active',    color: '#3fb950', icon: <CheckCircle  className="w-3.5 h-3.5" /> },
  UPCOMING:  { label: 'Upcoming',  color: '#d29922', icon: <Clock        className="w-3.5 h-3.5" /> },
  COMPLETED: { label: 'Completed', color: '#8b949e', icon: <CheckCircle  className="w-3.5 h-3.5" /> },
  CANCELLED: { label: 'Cancelled', color: '#f85149', icon: <XCircle      className="w-3.5 h-3.5" /> },
  DRAFT:     { label: 'Draft',     color: '#8b949e', icon: <Clock        className="w-3.5 h-3.5" /> },
};

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

// ── Delete Confirmation Modal ────────────────────────────────────────────────

function DeleteModal({
  activity,
  onConfirm,
  onCancel,
  loading,
}: {
  activity: AdminActivity;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div
        className="w-full max-w-md rounded-3xl p-6 border animate-scale-in"
        style={{ background: '#161b22', borderColor: '#30363d' }}
      >
        <div className="flex items-start gap-4 mb-5">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(248,81,73,0.15)' }}
          >
            <AlertTriangle className="w-5 h-5" style={{ color: '#f85149' }} />
          </div>
          <div>
            <h3 className="text-white font-bold text-base" style={{ fontFamily: 'var(--font-poppins)' }}>
              Remove Activity
            </h3>
            <p className="text-sm mt-0.5" style={{ color: '#8b949e' }}>
              This will permanently cancel <strong className="text-white">"{activity.title}"</strong> and notify the creator.
            </p>
          </div>
          <button onClick={onCancel} className="ml-auto" style={{ color: '#8b949e' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-5">
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#8b949e' }}>
            Reason for removal <span style={{ color: '#f85149' }}>*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Describe why this activity is being removed..."
            className="w-full px-4 py-3 rounded-2xl text-sm resize-none focus:outline-none transition-all"
            style={{
              background: '#0d1117',
              border: '1.5px solid #30363d',
              color: '#e6edf3',
              fontFamily: 'var(--font-inter)',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#f85149')}
            onBlur={(e) => (e.target.style.borderColor = '#30363d')}
          />
          <p className="text-xs mt-1.5" style={{ color: '#484f58' }}>
            This reason is logged in the audit trail and sent to the creator.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all duration-200"
            style={{ background: '#21262d', color: '#8b949e', border: '1px solid #30363d' }}
          >
            Cancel
          </button>
          <button
            onClick={() => reason.trim() && onConfirm(reason.trim())}
            disabled={!reason.trim() || loading}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: reason.trim() ? '#f85149' : '#8b949e', color: 'white' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Removing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4" /> Remove Activity
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Admin Message Modal ─────────────────────────────────────────────────────

function MessageModal({
  activity,
  onSend,
  onCancel,
  loading,
  sent,
}: {
  activity: AdminActivity;
  onSend: (message: string) => void;
  onCancel: () => void;
  loading: boolean;
  sent: boolean;
}) {
  const [message, setMessage] = useState('');
  const creatorName = activity.creator.profile?.displayName ?? activity.creator.username;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div
        className="w-full max-w-lg rounded-3xl p-6 border animate-scale-in"
        style={{ background: '#161b22', borderColor: '#30363d' }}
      >
        {sent ? (
          <div className="text-center py-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(63,185,80,0.15)' }}
            >
              <CheckCircle className="w-7 h-7" style={{ color: '#3fb950' }} />
            </div>
            <h3 className="text-white font-bold text-lg mb-2" style={{ fontFamily: 'var(--font-poppins)' }}>
              Message Sent
            </h3>
            <p className="text-sm mb-5" style={{ color: '#8b949e' }}>
              {creatorName} will receive this as an official system notification.
            </p>
            <button
              onClick={onCancel}
              className="px-5 py-2.5 rounded-2xl text-sm font-semibold"
              style={{ background: '#21262d', color: '#e6edf3', border: '1px solid #30363d' }}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-4 mb-5">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(56,139,253,0.15)' }}
              >
                <MessageSquare className="w-5 h-5" style={{ color: '#58a6ff' }} />
              </div>
              <div className="min-w-0">
                <h3 className="text-white font-bold text-base" style={{ fontFamily: 'var(--font-poppins)' }}>
                  Message Activity Creator
                </h3>
                <p className="text-sm mt-0.5" style={{ color: '#8b949e' }}>
                  Send an official admin notice to <strong className="text-white">{creatorName}</strong> about <strong className="text-white">"{activity.title}"</strong>.
                </p>
              </div>
              <button onClick={onCancel} className="ml-auto" style={{ color: '#8b949e' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-5 rounded-2xl p-3.5" style={{ background: '#0d1117', border: '1px solid #30363d' }}>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4" style={{ color: '#58a6ff' }} />
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#58a6ff' }}>
                  Admin system notification
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#8b949e' }}>
                This does not open a personal chat. It stays inside the admin control centre, reaches the owner's notification feed, and is written to the audit trail.
              </p>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#8b949e' }}>
                Message <span style={{ color: '#f85149' }}>*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                maxLength={600}
                placeholder="Write the admin notice the activity owner should receive..."
                className="w-full px-4 py-3 rounded-2xl text-sm resize-none focus:outline-none transition-all"
                style={{
                  background: '#0d1117',
                  border: '1.5px solid #30363d',
                  color: '#e6edf3',
                  fontFamily: 'var(--font-inter)',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#58a6ff')}
                onBlur={(e) => (e.target.style.borderColor = '#30363d')}
              />
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-xs" style={{ color: '#484f58' }}>
                  Keep it clear, formal, and tied to the activity.
                </p>
                <span className="text-xs" style={{ color: '#484f58' }}>{message.length}/600</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all duration-200"
                style={{ background: '#21262d', color: '#8b949e', border: '1px solid #30363d' }}
              >
                Cancel
              </button>
              <button
                onClick={() => message.trim() && onSend(message.trim())}
                disabled={!message.trim() || loading}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: message.trim() ? '#238636' : '#8b949e', color: 'white' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" /> Send Notice
                  </span>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Activity Detail Drawer ───────────────────────────────────────────────────

function ActivityDrawer({
  activity,
  onClose,
  onDelete,
  onMessage,
}: {
  activity: AdminActivity;
  onClose: () => void;
  onDelete: () => void;
  onMessage: () => void;
}) {
  const status = STATUS_CONFIG[activity.status] ?? STATUS_CONFIG.DRAFT;
  const creator = activity.creator;
  const hostName = creator.profile?.displayName ?? creator.username;

  return (
    <div
      className="fixed inset-y-0 right-0 w-full max-w-lg z-40 flex flex-col border-l"
      style={{ background: '#161b22', borderColor: '#30363d' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: '#30363d' }}>
        <button onClick={onClose} style={{ color: '#8b949e' }}>
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-white font-bold flex-1 truncate" style={{ fontFamily: 'var(--font-poppins)' }}>
          Activity Detail
        </h2>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
          style={{ background: `${status.color}18`, color: status.color }}
        >
          {status.icon} {status.label}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {/* Cover */}
        {activity.coverImageUrl ? (
          <img
            src={activity.coverImageUrl}
            alt={activity.title}
            className="w-full h-48 object-cover rounded-2xl"
            style={{ border: '1px solid #30363d' }}
          />
        ) : (
          <div
            className="w-full h-48 rounded-2xl flex items-center justify-center"
            style={{ background: '#0d1117', border: '1px dashed #30363d' }}
          >
            <Activity className="w-10 h-10" style={{ color: '#30363d' }} />
          </div>
        )}

        {/* Title */}
        <div>
          <h3 className="text-white text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-poppins)' }}>
            {activity.title}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: '#8b949e' }}>
            {activity.description}
          </p>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Calendar, label: 'Scheduled', value: formatDate(activity.scheduledAt) },
            { icon: Users, label: 'Participants', value: `${activity._count.participants} joined` },
            { icon: MapPin, label: 'Location', value: [activity.city, activity.state].filter(Boolean).join(', ') || activity.address || '—' },
            { icon: Tag, label: 'Category', value: activity.category },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-2xl p-3.5"
              style={{ background: '#0d1117', border: '1px solid #30363d' }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon className="w-3.5 h-3.5" style={{ color: '#6f9a35' }} />
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#8b949e' }}>{label}</span>
              </div>
              <p className="text-white text-sm font-medium truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* Creator */}
        <div className="rounded-2xl p-4" style={{ background: '#0d1117', border: '1px solid #30363d' }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#8b949e' }}>Activity Creator</p>
          <div className="flex items-center gap-3">
            {creator.profile?.avatarUrl ? (
              <img src={creator.profile.avatarUrl} className="w-10 h-10 rounded-full object-cover" alt={hostName} />
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: 'linear-gradient(135deg, #6f9a35, #435e21)' }}
              >
                {hostName[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-white font-semibold text-sm">{hostName}</p>
              <p className="text-xs" style={{ color: '#8b949e' }}>@{creator.username}</p>
            </div>
          </div>
        </div>

        {/* Tags */}
        {activity.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activity.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: 'rgba(111,154,53,0.12)', color: '#8bb451', border: '1px solid rgba(111,154,53,0.2)' }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Created */}
        <p className="text-xs" style={{ color: '#484f58' }}>
          Created on {formatDate(activity.createdAt)}
        </p>
      </div>

      {/* Action bar */}
      <div className="px-6 py-4 border-t space-y-3" style={{ borderColor: '#30363d' }}>
        <button
          onClick={onMessage}
          className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200"
          style={{ background: 'rgba(111,154,53,0.12)', color: '#8bb451', border: '1px solid rgba(111,154,53,0.25)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(111,154,53,0.2)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(111,154,53,0.12)'; }}
        >
          <MessageSquare className="w-4 h-4" />
          Message Creator
        </button>
        <button
          onClick={onDelete}
          className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200"
          style={{ background: 'rgba(248,81,73,0.1)', color: '#f85149', border: '1px solid rgba(248,81,73,0.2)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248,81,73,0.2)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(248,81,73,0.1)'; }}
        >
          <Trash2 className="w-4 h-4" />
          Remove Activity
        </button>
      </div>
    </div>
  );
}

// ── Main Dashboard Page ──────────────────────────────────────────────────────

export function AdminDashboardPage() {
  const qc = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const LIMIT = 12;

  const [selected, setSelected] = useState<AdminActivity | null>(null);
  const [toDelete, setToDelete] = useState<AdminActivity | null>(null);
  const [toMessage, setToMessage] = useState<AdminActivity | null>(null);
  const [messageSent, setMessageSent] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Stats ────────────────────────────────────────────────────────────────
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminApi.getStats,
    refetchInterval: 30_000,
  });

  // ── Activities ───────────────────────────────────────────────────────────
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-activities', page, search, statusFilter],
    queryFn: () =>
      adminApi.getActivities({
        page,
        limit: LIMIT,
        search: search || undefined,
        status: statusFilter || undefined,
      }),
    placeholderData: (prev) => prev,
  });

  // ── Delete mutation ──────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.deleteActivity(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-activities'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
      setToDelete(null);
      setSelected(null);
      showToast('Activity removed successfully.', 'success');
    },
    onError: () => showToast('Failed to remove activity. Please try again.', 'error'),
  });

  // ── Message creator ──────────────────────────────────────────────────────
  const messageMutation = useMutation({
    mutationFn: ({ activityId, message }: { activityId: string; message: string }) =>
      adminApi.messageCreator(activityId, message),
    onSuccess: () => {
      setMessageSent(true);
      showToast('System notice sent to activity creator.', 'success');
    },
    onError: () => showToast('Failed to send notice. Please try again.', 'error'),
  });

  const handleMessage = useCallback((activity: AdminActivity) => {
    setMessageSent(false);
    setToMessage(activity);
  }, []);

  const handleSearchChange = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  const handleStatusFilter = (v: string) => {
    setStatusFilter(v);
    setPage(1);
  };

  const statCards = [
    { label: 'Total Activities', value: stats?.activities.total ?? '—', color: '#6f9a35' },
    { label: 'Active Now', value: stats?.activities.active ?? '—', color: '#3fb950' },
    { label: 'Total Users', value: stats?.users.total ?? '—', color: '#388bfd' },
    { label: 'Pending Reports', value: stats?.reports.pending ?? '—', color: '#f85149' },
  ];

  const activities = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden" style={{ background: '#0d1117' }}>
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header
        className="flex items-center gap-4 px-6 py-4 border-b flex-shrink-0"
        style={{ background: '#161b22', borderColor: '#30363d' }}
      >
        <div className="flex items-center gap-2.5 flex-1">
          <Activity className="w-5 h-5" style={{ color: '#6f9a35' }} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-poppins)' }}>
                Activity Monitor
              </h1>
              <span
                className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                style={{ background: 'rgba(111,154,53,0.15)', color: '#8bb451' }}
              >
                {data?.total ?? '...'} total
              </span>
            </div>
            <p className="text-xs truncate" style={{ color: '#8b949e' }}>
              Review platform activities, contact owners through system notices, and remove unsafe listings.
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
          style={{ background: '#21262d', color: '#8b949e', border: '1px solid #30363d' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#e6edf3'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#8b949e'; }}
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </header>

      {/* ── Scrollable content ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-6">

        {/* Stat cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {statCards.map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-2xl p-4 border"
              style={{ background: '#161b22', borderColor: '#30363d' }}
            >
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#8b949e' }}>{label}</p>
              <p className="text-3xl font-bold" style={{ color, fontFamily: 'var(--font-poppins)' }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8b949e' }} />
            <input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search activities by title or description..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm focus:outline-none transition-all"
              style={{
                background: '#161b22',
                border: '1.5px solid #30363d',
                color: '#e6edf3',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#6f9a35')}
              onBlur={(e) => (e.target.style.borderColor = '#30363d')}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8b949e' }} />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-2xl text-sm focus:outline-none appearance-none cursor-pointer"
              style={{
                background: '#161b22',
                border: '1.5px solid #30363d',
                color: statusFilter ? '#e6edf3' : '#8b949e',
              }}
            >
              <option value="">All Statuses</option>
              {Object.entries(STATUS_CONFIG).map(([val, { label }]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Activity table / grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#6f9a35' }} />
              <p className="text-sm" style={{ color: '#8b949e' }}>Loading activities...</p>
            </div>
          </div>
        ) : activities.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-24 rounded-3xl border"
            style={{ background: '#161b22', borderColor: '#30363d' }}
          >
            <Activity className="w-12 h-12 mb-4" style={{ color: '#30363d' }} />
            <p className="text-white font-semibold mb-1">No activities found</p>
            <p className="text-sm" style={{ color: '#8b949e' }}>
              Try adjusting your search or filter
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Table header */}
            <div
              className="hidden md:grid grid-cols-12 gap-4 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wide"
              style={{ color: '#8b949e', background: '#161b22', border: '1px solid #30363d' }}
            >
              <span className="col-span-4">Activity</span>
              <span className="col-span-2">Creator</span>
              <span className="col-span-2">Status</span>
              <span className="col-span-2">Date</span>
              <span className="col-span-1">Members</span>
              <span className="col-span-1 text-right">Actions</span>
            </div>

            {activities.map((act) => {
              const status = STATUS_CONFIG[act.status] ?? STATUS_CONFIG.DRAFT;
              const host = act.creator;
              const hostName = host.profile?.displayName ?? host.username;

              return (
                <div
                  key={act.id}
                  className="grid grid-cols-12 gap-4 items-center px-4 py-4 rounded-2xl border transition-all duration-200 cursor-pointer"
                  style={{ background: '#161b22', borderColor: '#30363d' }}
                  onClick={() => setSelected(act)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = '#6f9a35';
                    (e.currentTarget as HTMLDivElement).style.background = '#1a2233';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = '#30363d';
                    (e.currentTarget as HTMLDivElement).style.background = '#161b22';
                  }}
                >
                  {/* Activity info */}
                  <div className="col-span-12 md:col-span-4 flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{ background: 'rgba(111,154,53,0.15)', color: '#8bb451' }}
                    >
                      {act.title[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{act.title}</p>
                      <p className="text-xs truncate" style={{ color: '#8b949e' }}>
                        {act.category} · {act.isFree ? 'Free' : `₹${act.price}`}
                      </p>
                    </div>
                  </div>

                  {/* Creator */}
                  <div className="hidden md:flex col-span-2 items-center gap-2 min-w-0">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: '#435e21' }}
                    >
                      {hostName[0]?.toUpperCase()}
                    </div>
                    <span className="text-xs truncate" style={{ color: '#8b949e' }}>
                      {hostName}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="hidden md:block col-span-2">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: `${status.color}18`, color: status.color }}
                    >
                      {status.icon} {status.label}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="hidden md:block col-span-2">
                    <span className="text-xs" style={{ color: '#8b949e' }}>
                      {act.scheduledAt
                        ? new Date(act.scheduledAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </span>
                  </div>

                  {/* Participants count */}
                  <div className="hidden md:flex col-span-1 items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" style={{ color: '#8b949e' }} />
                    <span className="text-xs text-white font-semibold">{act._count.participants}</span>
                  </div>

                  {/* Quick actions */}
                  <div className="col-span-12 md:col-span-1 flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      title="View details"
                      onClick={() => setSelected(act)}
                      className="w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-200"
                      style={{ background: '#21262d', color: '#8b949e' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#e6edf3'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#8b949e'; }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Message creator"
                      onClick={() => handleMessage(act)}
                      className="w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-200"
                      style={{ background: 'rgba(111,154,53,0.12)', color: '#8bb451' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(111,154,53,0.25)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(111,154,53,0.12)'; }}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Delete activity"
                      onClick={() => setToDelete(act)}
                      className="w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-200"
                      style={{ background: 'rgba(248,81,73,0.1)', color: '#f85149' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248,81,73,0.2)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(248,81,73,0.1)'; }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-xs" style={{ color: '#8b949e' }}>
              Page {page} of {totalPages} - {data?.total} activities
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                style={{ background: '#21262d', color: '#8b949e', border: '1px solid #30363d' }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className="w-8 h-8 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      background: p === page ? '#6f9a35' : '#21262d',
                      color: p === page ? 'white' : '#8b949e',
                      border: '1px solid #30363d',
                    }}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                style={{ background: '#21262d', color: '#8b949e', border: '1px solid #30363d' }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Detail drawer ─────────────────────────────────────────────────── */}
      {selected && (
        <ActivityDrawer
          activity={selected}
          onClose={() => setSelected(null)}
          onDelete={() => { setToDelete(selected); setSelected(null); }}
          onMessage={() => handleMessage(selected)}
        />
      )}

      {/* ── Message modal ────────────────────────────────────────────────── */}
      {toMessage && (
        <MessageModal
          activity={toMessage}
          loading={messageMutation.isPending}
          sent={messageSent}
          onSend={(message) => messageMutation.mutate({ activityId: toMessage.id, message })}
          onCancel={() => {
            setToMessage(null);
            setMessageSent(false);
          }}
        />
      )}

      {/* ── Delete modal ──────────────────────────────────────────────────── */}
      {toDelete && (
        <DeleteModal
          activity={toDelete}
          loading={deleteMutation.isPending}
          onConfirm={(reason) => deleteMutation.mutate({ id: toDelete.id, reason })}
          onCancel={() => setToDelete(null)}
        />
      )}

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-medium border shadow-xl"
          style={{
            background: toast.type === 'success' ? 'rgba(63,185,80,0.15)' : 'rgba(248,81,73,0.15)',
            color: toast.type === 'success' ? '#3fb950' : '#f85149',
            borderColor: toast.type === 'success' ? 'rgba(63,185,80,0.3)' : 'rgba(248,81,73,0.3)',
          }}
        >
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
