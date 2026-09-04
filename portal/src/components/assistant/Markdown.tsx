import { Fragment, type ReactNode } from 'react';

/**
 * A minimal Markdown renderer for assistant answers and announcement bodies.
 *
 * Rendering to React elements rather than an HTML string means no
 * `dangerouslySetInnerHTML` and no sanitiser dependency, so model output and
 * user-authored announcements can never inject markup.
 */
const INLINE = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`)/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text
    .split(INLINE)
    .filter((part) => part !== '' && part !== undefined)
    .map((part, i) => {
      const key = `${keyPrefix}-${i}`;
      if (/^\*\*[\s\S]+\*\*$/.test(part)) {
        return (
          <strong key={key} className="font-medium text-ink">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (/^\*[^*][\s\S]*\*$/.test(part)) {
        return (
          <em key={key} className="italic">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (/^`[\s\S]+`$/.test(part)) {
        return (
          <code key={key} className="rounded bg-accent/10 px-1.5 py-0.5 font-mono text-[0.85em] text-accent">
            {part.slice(1, -1)}
          </code>
        );
      }
      return <Fragment key={key}>{part}</Fragment>;
    });
}

export function Markdown({
  content,
  className = '',
}: {
  content: string;
  className?: string;
}) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: string[] | null = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const key = `p-${blocks.length}`;
    blocks.push(
      <p key={key} className="leading-relaxed">
        {renderInline(paragraph.join(' '), key)}
      </p>,
    );
    paragraph = [];
  };

  const flushList = () => {
    if (!list) return;
    const key = `ul-${blocks.length}`;
    const items = list;
    blocks.push(
      <ul key={key} className="space-y-1.5">
        {items.map((item, i) => (
          <li key={`${key}-${i}`} className="flex gap-2.5 leading-relaxed">
            <span aria-hidden className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-accent" />
            <span>{renderInline(item, `${key}-${i}`)}</span>
          </li>
        ))}
      </ul>,
    );
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const bullet = line.match(/^[-*+]\s+(.*)$/);
    if (bullet) {
      flushParagraph();
      list = list ?? [];
      list.push(bullet[1]!);
      continue;
    }

    const heading = line.match(/^#{1,3}\s+(.*)$/);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push(
        <p key={`h-${blocks.length}`} className="font-medium text-ink">
          {renderInline(heading[1]!, `h-${blocks.length}`)}
        </p>,
      );
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();

  if (!blocks.length) return null;
  return <div className={`space-y-3 ${className}`}>{blocks}</div>;
}
