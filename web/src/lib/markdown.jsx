import React from 'react';

/**
 * A deliberately small Markdown renderer.
 *
 * The reflection log and assistant answers need bold, italic, inline code,
 * links, headings and bullets — nothing more. Rendering to React elements
 * (rather than an HTML string) means no `dangerouslySetInnerHTML` and no
 * sanitiser dependency, so champion-authored text can never inject markup.
 */

const INLINE = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|_[^_\n]+_|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

function renderInline(text, keyPrefix) {
  const parts = String(text).split(INLINE).filter((p) => p !== '' && p !== undefined);

  return parts.map((part, i) => {
    const key = `${keyPrefix}-i${i}`;

    if (/^(\*\*|__)[\s\S]+(\*\*|__)$/.test(part)) {
      return (
        <strong key={key} className="font-medium text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (/^(\*|_)[^*_][\s\S]*(\*|_)$/.test(part)) {
      return (
        <em key={key} className="italic text-white/90">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (/^`[\s\S]+`$/.test(part)) {
      return (
        <code
          key={key}
          className="rounded bg-gold-500/10 px-1.5 py-0.5 font-mono text-[0.85em] text-gold-300"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
      const href = link[2];
      // Only ever emit http(s) and relative targets — never javascript: URLs.
      const safe = /^(https?:\/\/|\/)/i.test(href) ? href : '#';
      return (
        <a
          key={key}
          href={safe}
          target={safe.startsWith('http') ? '_blank' : undefined}
          rel="noreferrer noopener"
          className="text-gold-400 underline decoration-gold-500/40 underline-offset-2 hover:decoration-gold-400"
        >
          {link[1]}
        </a>
      );
    }
    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
}

/** Parse a Markdown string into an array of React block elements. */
export function renderMarkdown(source, keyPrefix = 'md') {
  if (!source) return [];
  const lines = String(source).replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let paragraph = [];
  let list = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const key = `${keyPrefix}-p${blocks.length}`;
    blocks.push(
      <p key={key} className="leading-relaxed">
        {renderInline(paragraph.join(' '), key)}
      </p>,
    );
    paragraph = [];
  };

  const flushList = () => {
    if (!list) return;
    const key = `${keyPrefix}-ul${blocks.length}`;
    blocks.push(
      <ul key={key} className="ml-1 space-y-1.5">
        {list.map((item, i) => (
          <li key={`${key}-li${i}`} className="flex gap-2.5 leading-relaxed">
            <span aria-hidden className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-gold-500" />
            <span>{renderInline(item, `${key}-li${i}`)}</span>
          </li>
        ))}
      </ul>,
    );
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const key = `${keyPrefix}-h${blocks.length}`;
      const size = ['text-base', 'text-sm', 'text-[13px]'][heading[1].length - 1];
      blocks.push(
        <p key={key} className={`font-display uppercase tracking-wide text-white ${size}`}>
          {renderInline(heading[2], key)}
        </p>,
      );
      continue;
    }

    const bullet = line.match(/^\s*[-*+]\s+(.*)$/);
    if (bullet) {
      flushParagraph();
      list = list || [];
      list.push(bullet[1]);
      continue;
    }

    flushList();
    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();
  return blocks;
}

/** Drop-in block renderer for any Markdown string in the app. */
export default function Markdown({ children, className = '' }) {
  const blocks = renderMarkdown(children);
  if (!blocks.length) return null;
  return <div className={`space-y-3 text-sm text-white/70 ${className}`}>{blocks}</div>;
}
