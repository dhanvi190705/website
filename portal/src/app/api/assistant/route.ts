import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { authorize, failure } from '@/lib/api-auth';
import { assistantFallback, knowledgeBase } from '@/lib/content';
import { assistantSchema } from '@/lib/validation';

/** The API key never reaches the browser — this route is the only caller. */
const MODEL = 'claude-opus-5';

/**
 * Keyword retrieval over the governance/FAQ passages.
 *
 * Deliberately simple and deterministic: it decides which passage the model is
 * allowed to answer from, so the assistant cannot invent policy.
 */
function retrieve(question: string) {
  const text = question.toLowerCase();
  const words = text.split(/[^a-z0-9]+/).filter((w) => w.length > 3);

  let best: (typeof knowledgeBase)[number] | null = null;
  let bestScore = 0;

  for (const entry of knowledgeBase) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (text.includes(keyword)) score += 2;
      else if (words.some((w) => keyword.startsWith(w.slice(0, 5)) && w.length > 4)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  return bestScore >= 2 ? best : null;
}

const SYSTEM_PROMPT = [
  'You are the AI.Next Portal assistant for an internal AI programme.',
  'Answer only from the governance passage supplied in the user turn. Do not invent policy, deadlines, names or approval paths.',
  'If the passage does not cover what was asked, say so plainly and point the person to the Resources Hub or the AI / Tech Team.',
  'Be concise and concrete — a short paragraph, or a few bullets. Light Markdown only.',
].join(' ');

export async function POST(request: Request) {
  const auth = await authorize();
  if (!auth.ok) return auth.response;

  try {
    const parsed = assistantSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Ask a question first.' }, { status: 400 });
    }
    const { question, history } = parsed.data;

    const match = retrieve(question);

    // No key configured: say so honestly rather than pretending to be offline,
    // but still hand back the retrieved passage so the widget is useful anyway.
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        configured: false,
        answer: match?.passage ?? assistantFallback,
        source: match?.source ?? null,
        notice:
          'The AI assistant is not configured — set ANTHROPIC_API_KEY to enable full answers. Showing the matching policy text directly.',
      });
    }

    const grounding = match
      ? `Governance passage (${match.topic}):\n${match.passage}\n\nCite it as: ${match.source}`
      : 'No governance passage matched this question. Say that plainly and point them to the Resources Hub.';

    const client = new Anthropic();

    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 1024,
      // Opus 5 may decline a request outright; the server-side fallback re-runs
      // it on another model in the same call rather than returning nothing.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: SYSTEM_PROMPT,
      // A grounded FAQ lookup does not need deep reasoning; medium keeps the
      // widget responsive without dulling policy answers.
      output_config: { effort: 'medium' },
      messages: [
        ...history.map((turn) => ({ role: turn.role, content: turn.text })),
        { role: 'user' as const, content: `${grounding}\n\nQuestion: ${question}` },
      ],
    });

    if (response.stop_reason === 'refusal') {
      return NextResponse.json({
        configured: true,
        answer:
          'I could not answer that one. Please raise it with the AI / Tech Team, or check the Governance Policy in the Resources Hub.',
        source: null,
      });
    }

    const answer = response.content
      .filter((block): block is Extract<typeof block, { type: 'text' }> => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();

    return NextResponse.json({
      configured: true,
      answer: answer || assistantFallback,
      source: match?.source ?? null,
    });
  } catch (error) {
    // A model outage must not take the support widget down with it — fall back
    // to returning the retrieved passage verbatim.
    if (error instanceof Anthropic.APIError) {
      console.error('[assistant] upstream error', error.status, error.message);
      return NextResponse.json({
        configured: true,
        answer: assistantFallback,
        source: null,
        notice: 'The assistant is temporarily unavailable. Showing general guidance instead.',
      });
    }
    return failure(error, 'The assistant is unavailable.');
  }
}
