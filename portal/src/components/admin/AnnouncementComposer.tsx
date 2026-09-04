'use client';

import { useState } from 'react';
import { Eye, Megaphone, Pencil, Pin } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Markdown } from '@/components/assistant/Markdown';
import { cn, formatDateTime } from '@/lib/utils';

export type AdminAnnouncement = {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  publishedAt: string | null;
  authorName: string;
  createdAt: string;
};

/** Direct publishing interface — broadcasts to every champion on save. */
export function AnnouncementComposer({ initial }: { initial: AdminAnnouncement[] }) {
  const [items, setItems] = useState(initial);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pinned, setPinned] = useState(false);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const publish = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');

    if (title.trim().length < 3) {
      setError('Give the announcement a title.');
      return;
    }
    if (body.trim().length < 10) {
      setError('Write the body — at least 10 characters.');
      return;
    }

    setBusy(true);
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), body: body.trim(), pinned, publish: true }),
      });
      const data = (await res.json()) as { error?: string; announcement?: AdminAnnouncement };
      if (!res.ok || !data.announcement) {
        setError(data.error ?? 'Could not publish.');
        return;
      }
      setItems((prev) => [data.announcement!, ...prev]);
      setTitle('');
      setBody('');
      setPinned(false);
      setPreview(false);
      setNotice('Published. Every champion sees this on their Announcements screen.');
    } catch {
      setError('Could not reach the server.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <Card>
        <CardHeader
          eyebrow="Compose"
          title="Publish an announcement"
          description="Goes out to every champion immediately. Markdown is supported in the body."
          action={
            <div className="inline-flex rounded-lg border border-line bg-ground/60 p-1">
              {[
                { id: 'write', label: 'Write', icon: Pencil, on: !preview },
                { id: 'preview', label: 'Preview', icon: Eye, on: preview },
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setPreview(mode.id === 'preview')}
                  aria-pressed={mode.on}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors',
                    mode.on ? 'bg-accent-gradient text-ground' : 'text-ink-faint hover:text-accent',
                  )}
                >
                  <mode.icon size={11} strokeWidth={2} aria-hidden />
                  {mode.label}
                </button>
              ))}
            </div>
          }
        />

        <form onSubmit={publish} className="space-y-4 p-6">
          <div>
            <label htmlFor="announcement-title" className="label">
              Title
            </label>
            <input
              id="announcement-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="field"
              placeholder="e.g. Governance policy update — effective immediately"
            />
          </div>

          <div>
            <label htmlFor="announcement-body" className="label">
              Body
            </label>
            {preview ? (
              <div className="min-h-[180px] rounded-xl border border-line bg-ground/60 px-4 py-3.5">
                {body.trim() ? (
                  <Markdown content={body} className="text-[13.5px] text-ink-muted" />
                ) : (
                  <p className="text-[13px] italic text-ink-faint">Nothing written yet.</p>
                )}
              </div>
            ) : (
              <textarea
                id="announcement-body"
                rows={8}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="field min-h-[180px] resize-y leading-relaxed"
                placeholder={'What changed, who it affects, and what they must do.\n\n- **Action:** …\n- **By when:** …'}
              />
            )}
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
              Supports **bold** · *italic* · `code` · - bullets
            </p>
          </div>

          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="h-4 w-4 accent-[rgb(var(--c-accent))]"
            />
            <span className="text-[13px] text-ink-muted">
              Pin to the top — for items carrying an action or a deadline
            </span>
          </label>

          {error && <Alert tone="error">{error}</Alert>}
          {notice && <Alert tone="success">{notice}</Alert>}

          <Button type="submit" icon={Megaphone} loading={busy}>
            Publish to all champions
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader
          eyebrow="Published"
          title="What champions can see"
          action={<Badge tone="neutral">{items.length}</Badge>}
        />

        {items.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="Nothing published yet"
            description="The first announcement you publish appears here and on every champion's Announcements screen."
          />
        ) : (
          <ul className="divide-y divide-line/50">
            {items.map((item) => (
              <li key={item.id} className="p-5">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {item.pinned && (
                    <Badge tone="accent" icon={Pin}>
                      Pinned
                    </Badge>
                  )}
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                    {formatDateTime(item.publishedAt ?? item.createdAt)} · {item.authorName}
                  </span>
                </div>
                <p className="text-[13.5px] text-ink">{item.title}</p>
                <div className="mt-2">
                  <Markdown content={item.body} className="text-[12.5px] text-ink-muted" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
