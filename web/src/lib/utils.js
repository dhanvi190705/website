/** Join conditional class names — the one-liner every component reaches for. */
export function cn(...parts) {
  return parts.filter(Boolean).join(' ');
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/** "12 Nov 2025" — short, unambiguous, locale-stable. */
export function formatDate(value, opts = {}) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', ...opts });
}

/** Whole days between two dates, positive when `to` is later. */
export function daysBetween(from, to = new Date()) {
  const a = new Date(from).setHours(0, 0, 0, 0);
  const b = new Date(to).setHours(0, 0, 0, 0);
  return Math.round((b - a) / 86_400_000);
}

export function relativeDays(value) {
  const diff = daysBetween(value);
  if (diff <= 0) return 'today';
  if (diff === 1) return 'yesterday';
  if (diff < 30) return `${diff} days ago`;
  const months = Math.round(diff / 30);
  return months === 1 ? 'a month ago' : `${months} months ago`;
}

export function addDays(value, days) {
  const d = new Date(value);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function initialsOf(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

/** Stable id for client-created records (proofs, reflections, messages). */
export function uid(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Health score → the semantic band the whole UI colours by. */
export function healthBand(score) {
  if (score >= 75) return { id: 'strong', label: 'Strong', color: '#4ADE80' };
  if (score >= 55) return { id: 'steady', label: 'Steady', color: '#FFD700' };
  if (score >= 40) return { id: 'watch', label: 'Watch', color: '#FBBF24' };
  return { id: 'risk', label: 'At risk', color: '#F87171' };
}
