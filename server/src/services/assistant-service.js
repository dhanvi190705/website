import { assistantFallback, knowledgeBase } from '../data/seed-data.js';
import { env } from '../lib/env.js';

/** Deterministic keyword retrieval over the FAQ base. */
function retrieve(question) {
  const text = String(question).toLowerCase();
  const words = text.split(/[^a-z0-9]+/).filter((w) => w.length > 2);

  let best = null;
  let bestScore = 0;

  for (const entry of knowledgeBase) {
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

  return bestScore >= 2 ? best : null;
}

/**
 * Answer a support question.
 *
 * Retrieval always runs. With ANTHROPIC_API_KEY set, the matched passage is
 * handed to the model as grounding so answers stay inside programme policy
 * rather than being invented; without a key the passage is returned directly.
 */
export async function ask(question, history = []) {
  const match = retrieve(question);

  if (!env.anthropicApiKey) {
    return match
      ? { answer: match.answer, sources: match.sources, confident: true }
      : { answer: assistantFallback, sources: [], confident: false };
  }

  const grounding = match
    ? `Programme policy passage:\n${match.answer}\nCite it as: ${match.sources.join(', ')}`
    : 'No matching policy passage was found. Say so plainly rather than guessing.';

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: env.assistantModel,
        max_tokens: 600,
        system:
          'You are the AI NEXT concierge for an internal AI champions programme. ' +
          'Answer only from the supplied programme policy passage. Be concise and concrete. ' +
          'If the passage does not cover the question, say so and point to the Resource & Policy Vault. ' +
          'Format with light Markdown.',
        messages: [
          ...history
            .filter((m) => m.role === 'user' || m.role === 'assistant')
            .slice(-6)
            .map((m) => ({ role: m.role, content: String(m.text || m.content || '') })),
          { role: 'user', content: `${grounding}\n\nQuestion: ${question}` },
        ],
      }),
    });

    if (!res.ok) throw new Error(`Assistant upstream ${res.status}`);

    const data = await res.json();
    const answer = data.content?.map((block) => block.text).filter(Boolean).join('\n') || '';

    return {
      answer: answer || assistantFallback,
      sources: match?.sources || [],
      confident: Boolean(answer && match),
    };
  } catch (error) {
    // A model outage must not take the support widget down with it.
    console.error('[assistant] falling back to local retrieval:', error.message);
    return match
      ? { answer: match.answer, sources: match.sources, confident: true }
      : { answer: assistantFallback, sources: [], confident: false };
  }
}
