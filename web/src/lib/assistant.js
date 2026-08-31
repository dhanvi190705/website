import { assistantFallback, assistantKnowledge } from '../data/mockData';

/**
 * Local keyword retrieval over the FAQ knowledge base.
 *
 * Deliberately simple and deterministic so the widget answers instantly with no
 * network and no key. `lib/api.js` will call POST /api/assistant instead when
 * VITE_API_URL is configured, and the backend can put a real model behind it.
 */
export function answerLocally(question) {
  const text = String(question).toLowerCase();
  const words = text.split(/[^a-z0-9]+/).filter((w) => w.length > 2);

  let best = null;
  let bestScore = 0;

  for (const entry of assistantKnowledge) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (text.includes(keyword)) score += keyword.includes(' ') ? 3 : 2;
      else if (words.some((w) => w.startsWith(keyword.slice(0, 4)) && keyword.length > 4)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  if (!best || bestScore < 2) {
    return { answer: assistantFallback, sources: [], confident: false };
  }
  return { answer: best.answer, sources: best.sources, confident: true };
}
