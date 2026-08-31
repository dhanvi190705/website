import { NEWSLETTER_INTERVAL_DAYS, PROGRAMME_START, newsletterNotes } from '../data/mockData';
import { addDays, formatDate } from './utils';

/**
 * Build the fortnightly newsletter run.
 *
 * The cadence is derived from the programme start, so the hub keeps itself
 * current: it works out which issue the calendar is on today, shows the most
 * recent `count` issues, and always appends the next scheduled one so the
 * countdown card has something to count down to.
 */
export function buildNewsletterIssues({ now = new Date(), count = 8 } = {}) {
  const start = new Date(PROGRAMME_START);
  const elapsedDays = Math.floor((now - start) / 86_400_000);

  // Issue 1 publishes on day 0; issue n on day (n-1) * interval.
  const currentNumber = Math.max(1, Math.floor(elapsedDays / NEWSLETTER_INTERVAL_DAYS) + 1);
  const firstNumber = Math.max(1, currentNumber - count + 1);

  const issues = [];
  for (let n = firstNumber; n <= currentNumber + 1; n += 1) {
    const date = addDays(start, (n - 1) * NEWSLETTER_INTERVAL_DAYS);
    const note = editorialFor(n);
    const published = date <= now;

    issues.push({
      id: `issue-${String(n).padStart(2, '0')}`,
      number: n,
      label: `Issue ${String(n).padStart(2, '0')}`,
      date: date.toISOString().slice(0, 10),
      dateLabel: formatDate(date),
      windowLabel: `${formatDate(date)} — ${formatDate(addDays(date, NEWSLETTER_INTERVAL_DAYS - 1))}`,
      headline: note.headline,
      lede: note.lede,
      tags: note.tags,
      status: published ? 'published' : 'scheduled',
      readMinutes: 4 + (n % 3),
    });
  }

  // The newest published issue is the one on the stand right now.
  const lastPublished = [...issues].reverse().find((i) => i.status === 'published');
  if (lastPublished) lastPublished.status = 'live';

  return issues.reverse(); // newest first
}

/**
 * Editorial copy for an issue. The opening run is hand-written; later issues
 * fall back to a deterministic rotation so every card still says something,
 * and real copy can be dropped in per issue number at any time.
 */
const ROTATION = [
  {
    headline: 'What shipped this fortnight',
    lede: 'The builds that moved a stage, the proof behind each advance, and the departments that cleared a milestone.',
    tags: ['Stage advances', 'Proof', 'Milestones'],
  },
  {
    headline: 'Blockers and how they cleared',
    lede: 'The obstacles champions logged, which specialist picked them up, and what finally unblocked the work.',
    tags: ['Blockers', 'AI Lab', 'Specialists'],
  },
  {
    headline: 'Accuracy check',
    lede: 'How champion tools are measuring against the manual process they replaced, and where the gap still sits.',
    tags: ['Validation', 'Accuracy', 'Adoption'],
  },
  {
    headline: 'Policy in practice',
    lede: 'Classification calls made this fortnight, the approval paths taken, and what changed in the governance guidance.',
    tags: ['Policy', 'Governance', 'Approvals'],
  },
];

function editorialFor(number) {
  return newsletterNotes[number] || ROTATION[(number - 1) % ROTATION.length];
}

/** Days until the next scheduled issue drops. */
export function nextIssueCountdown(issues, now = new Date()) {
  const next = [...issues].reverse().find((i) => i.status === 'scheduled');
  if (!next) return null;
  const days = Math.max(0, Math.ceil((new Date(next.date) - now) / 86_400_000));
  return { issue: next, days };
}
