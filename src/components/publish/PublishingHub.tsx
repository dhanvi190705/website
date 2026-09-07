"use client";

import { Eye, Loader2, Send, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import ReactMarkdown from "react-markdown";

type Announcement = {
  id: string;
  title: string;
  content: string;
  isPublished: boolean;
  createdAt: Date;
  author: { name: string };
};

export function PublishingHub({ announcements }: { announcements: Announcement[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handlePublish(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, isPublished: true }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(typeof body?.error === "string" ? body.error : "Failed to publish.");
      return;
    }

    setTitle("");
    setContent("");
    router.refresh();
  }

  async function toggle(id: string, isPublished: boolean) {
    setBusyId(id);
    await fetch(`/api/announcements/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !isPublished }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this announcement permanently?")) return;
    setBusyId(id);
    await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handlePublish} className="card space-y-4 p-5">
        <div>
          <label className="label">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required className="input-field" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Content (Markdown supported)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={12}
              placeholder={"## Heading\n\nWrite your announcement here. **Bold**, _italic_, lists, and links are all supported."}
              className="input-field font-mono text-xs"
            />
          </div>
          <div>
            <label className="label flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              Live Preview
            </label>
            <div className="h-[calc(100%-1.5rem)] min-h-[220px] rounded-lg border border-surface-border bg-surface-100/60 p-3">
              {content ? (
                <div className="md-content text-sm text-neutral-300">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-xs text-neutral-600">Preview will appear here as you type.</p>
              )}
            </div>
          </div>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-gold">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Publish Announcement
        </button>
      </form>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-neutral-100">
          Published History ({announcements.length})
        </h2>
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-medium text-neutral-100">{a.title}</h3>
                  <p className="text-xs text-neutral-600">
                    {a.author.name} · {new Date(a.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    disabled={busyId === a.id}
                    onClick={() => toggle(a.id, a.isPublished)}
                    className="btn-outline text-xs"
                  >
                    {a.isPublished ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    disabled={busyId === a.id}
                    onClick={() => remove(a.id)}
                    className="rounded-lg border border-red-900/60 p-1.5 text-red-400 transition hover:bg-red-950/40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {announcements.length === 0 && (
            <p className="py-6 text-center text-sm text-neutral-600">No announcements yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
