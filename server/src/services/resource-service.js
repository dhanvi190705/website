import { getPrisma } from '../lib/prisma.js';
import { usePrisma } from '../lib/env.js';
import {
  NEWSLETTER_INTERVAL_DAYS,
  PROGRAMME_START,
  documents,
} from '../data/seed-data.js';

/**
 * Newsletter issues on the fortnightly cadence.
 *
 * The run is derived from the calendar rather than stored as a fixed list, so
 * the hub stays current on its own. Stored issues (once editors write them)
 * override the generated placeholder for the same issue number.
 */
export async function getNewsletterIssues({ now = new Date(), count = 8 } = {}) {
  const stored = usePrisma
    ? await getPrisma().newsletterIssue.findMany({ orderBy: { number: 'asc' } })
    : [];
  const byNumber = new Map(stored.map((issue) => [issue.number, issue]));

  const start = new Date(PROGRAMME_START);
  const elapsedDays = Math.floor((now - start) / 86_400_000);
  // Issue 1 publishes on day 0; issue n on day (n-1) * interval. Always emit the
  // next scheduled issue so clients have a date to count down to.
  const currentNumber = Math.max(1, Math.floor(elapsedDays / NEWSLETTER_INTERVAL_DAYS) + 1);
  const firstNumber = Math.max(1, currentNumber - count + 1);
  const issues = [];

  for (let n = firstNumber; n <= currentNumber + 1; n += 1) {
    const date = new Date(start);
    date.setDate(date.getDate() + (n - 1) * NEWSLETTER_INTERVAL_DAYS);

    const editorial = byNumber.get(n);
    issues.push({
      id: `issue-${String(n).padStart(2, '0')}`,
      number: n,
      label: `Issue ${String(n).padStart(2, '0')}`,
      date: date.toISOString().slice(0, 10),
      headline: editorial?.headline || `Fortnight ${n}`,
      lede:
        editorial?.lede ||
        'A round-up of champion progress, milestones cleared across departments, and what lands in the next fortnight.',
      tags: editorial?.tags || ['Programme', 'Champion progress'],
      status: date <= now ? 'published' : 'scheduled',
      readMinutes: 4 + (n % 3),
    });
  }

  const lastPublished = [...issues].reverse().find((i) => i.status === 'published');
  if (lastPublished) lastPublished.status = 'live';

  return issues.reverse();
}

export async function getResources() {
  if (!usePrisma) {
    return {
      documents: documents.map((d) => ({ ...d, id: d.slug, filename: d.href.split('/').pop() })),
      newsletters: await getNewsletterIssues(),
    };
  }

  const rows = await getPrisma().resource.findMany({
    orderBy: [{ category: 'asc' }, { order: 'asc' }],
  });

  return {
    documents: rows
      .filter((r) => r.category === 'document')
      .map((r) => ({
        id: r.id,
        kicker: r.kicker,
        title: r.title,
        body: r.body,
        meta: r.meta,
        href: r.href,
        filename: r.href.split('/').pop(),
      })),
    frameworks: rows.filter((r) => r.category === 'framework'),
    newsletters: await getNewsletterIssues(),
  };
}
