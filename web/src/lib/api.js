import {
  champions,
  currentUser,
  departments,
  projects,
  reviewQueue,
  seedProofs,
  seedReflections,
  vaultDocuments,
} from '../data/mockData';
import { answerLocally } from './assistant';
import { uid } from './utils';

/**
 * Data access layer.
 *
 * With no VITE_API_URL the app runs entirely on the bundled dataset, so it is
 * fully interactive on first `npm run dev`. Set VITE_API_URL (or run the Vite
 * dev proxy against the Express service in ../server) and every call below
 * switches to the live endpoint with the same response shape — nothing in the
 * components changes.
 */
export const API_BASE = import.meta.env?.VITE_API_URL || '';
export const isLive = Boolean(API_BASE);

const LATENCY_MS = 260; // Enough for loading states to be real, not theatre.

function mock(value) {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), LATENCY_MS));
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}${detail ? ` — ${detail}` : ''}`);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  async getSession() {
    if (!isLive) return mock({ user: currentUser });
    return request('/api/session');
  },

  async getProgramme() {
    if (!isLive) return mock({ departments, champions, projects });
    return request('/api/programme');
  },

  async getWorkspace(championId) {
    if (!isLive) {
      // Fall back to the champion's own department rather than an arbitrary
      // project, so a data edit can never silently show someone else's work.
      const project =
        projects.find((p) => p.id === currentUser.projectId) ||
        projects.find((p) => p.deptCode === currentUser.deptCode);
      return mock({ project: project || null, proofs: seedProofs, reflections: seedReflections });
    }
    return request(`/api/champions/${encodeURIComponent(championId)}/workspace`);
  },

  async submitStatus(championId, payload) {
    if (!isLive) {
      // Echo back a persisted-looking record so optimistic UI has something real.
      return mock({
        id: uid('submission'),
        receivedAt: new Date().toISOString(),
        status: 'pending_review',
        reviewer: 'AI Specialist bench',
        ...payload,
      });
    }
    return request(`/api/champions/${encodeURIComponent(championId)}/status`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getResources() {
    if (!isLive) return mock({ documents: vaultDocuments });
    return request('/api/resources');
  },

  async getDashboard() {
    if (!isLive) return mock({ projects, departments, champions, reviewQueue });
    return request('/api/dashboard');
  },

  async ask(question, history = []) {
    if (!isLive) return mock(answerLocally(question));
    return request('/api/assistant', {
      method: 'POST',
      body: JSON.stringify({ question, history }),
    });
  },
};

export default api;
