"use client";

import { Megaphone } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

type Announcement = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  author: { name: string };
};

export function AnnouncementsFeed({ announcements }: { announcements: Announcement[] }) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Megaphone className="h-4 w-4 text-gold-500" />
        <h2 className="text-sm font-semibold text-neutral-100">Announcements</h2>
      </div>

      <div className="space-y-4">
        {announcements.length === 0 && (
          <p className="text-sm text-neutral-600">No announcements published yet.</p>
        )}
        {announcements.map((a) => (
          <article key={a.id} className="border-b border-surface-border/60 pb-4 last:border-0 last:pb-0">
            <h3 className="text-sm font-medium text-neutral-100">{a.title}</h3>
            <p className="mb-1.5 text-xs text-neutral-600">
              {a.author.name} · {new Date(a.createdAt).toLocaleDateString()}
            </p>
            <div className="md-content text-sm text-neutral-400">
              <ReactMarkdown>{a.content}</ReactMarkdown>
            </div>
          </article>
        ))}
      </div>

      <Link
        href="/resources"
        className="mt-4 block text-center text-xs font-medium text-gold-500 hover:text-gold-400"
      >
        View Resources Hub →
      </Link>
    </div>
  );
}
