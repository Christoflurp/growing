import { openUrl } from "@tauri-apps/plugin-opener";

interface MarkdownTextProps {
  text: string;
  className?: string;
  disableLinks?: boolean;
}

type ParsedSegment =
  | { type: "text"; content: string }
  | { type: "bold"; content: string }
  | { type: "italic"; content: string }
  | { type: "link"; text: string; url: string }
  | { type: "url"; url: string };

function parseMarkdown(text: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  let remaining = text;

  const patterns = [
    { regex: /\*\*(.+?)\*\*/g, type: "bold" as const },
    { regex: /__(.+?)__/g, type: "bold" as const },
    { regex: /\*(.+?)\*/g, type: "italic" as const },
    { regex: /_(.+?)_/g, type: "italic" as const },
    { regex: /\[([^\]]+)\]\(([^)]+)\)/g, type: "mdlink" as const },
    { regex: /(https?:\/\/[^\s<>[\]()]+)/g, type: "url" as const },
  ];

  const allMatches: Array<{
    index: number;
    length: number;
    type: string;
    content?: string;
    text?: string;
    url?: string;
  }> = [];

  for (const { regex, type } of patterns) {
    const r = new RegExp(regex.source, regex.flags);
    let match;
    while ((match = r.exec(text)) !== null) {
      if (type === "mdlink") {
        allMatches.push({
          index: match.index,
          length: match[0].length,
          type: "link",
          text: match[1],
          url: match[2],
        });
      } else if (type === "url") {
        allMatches.push({
          index: match.index,
          length: match[0].length,
          type: "url",
          url: match[1],
        });
      } else {
        allMatches.push({
          index: match.index,
          length: match[0].length,
          type,
          content: match[1],
        });
      }
    }
  }

  allMatches.sort((a, b) => a.index - b.index);

  const usedRanges: Array<[number, number]> = [];
  const filteredMatches = allMatches.filter((m) => {
    const start = m.index;
    const end = m.index + m.length;
    for (const [usedStart, usedEnd] of usedRanges) {
      if (start < usedEnd && end > usedStart) {
        return false;
      }
    }
    usedRanges.push([start, end]);
    return true;
  });

  let cursor = 0;
  for (const match of filteredMatches) {
    if (match.index > cursor) {
      segments.push({ type: "text", content: remaining.slice(cursor, match.index) });
    }

    if (match.type === "bold") {
      segments.push({ type: "bold", content: match.content! });
    } else if (match.type === "italic") {
      segments.push({ type: "italic", content: match.content! });
    } else if (match.type === "link") {
      segments.push({ type: "link", text: match.text!, url: match.url! });
    } else if (match.type === "url") {
      segments.push({ type: "url", url: match.url! });
    }

    cursor = match.index + match.length;
  }

  if (cursor < text.length) {
    segments.push({ type: "text", content: text.slice(cursor) });
  }

  return segments.length > 0 ? segments : [{ type: "text", content: text }];
}

function handleLinkClick(e: React.MouseEvent, url: string) {
  e.preventDefault();
  e.stopPropagation();
  openUrl(url);
}

export function MarkdownText({ text, className, disableLinks }: MarkdownTextProps) {
  const segments = parseMarkdown(text);

  return (
    <span className={className}>
      {segments.map((segment, i) => {
        switch (segment.type) {
          case "bold":
            return <strong key={i}>{segment.content}</strong>;
          case "italic":
            return <em key={i}>{segment.content}</em>;
          case "link":
            if (disableLinks) {
              return <span key={i} className="markdown-link-text">{segment.text}</span>;
            }
            return (
              <a
                key={i}
                href={segment.url}
                onClick={(e) => handleLinkClick(e, segment.url)}
                className="markdown-link"
              >
                {segment.text}
              </a>
            );
          case "url":
            if (disableLinks) {
              return <span key={i} className="markdown-link-text">{segment.url}</span>;
            }
            return (
              <a
                key={i}
                href={segment.url}
                onClick={(e) => handleLinkClick(e, segment.url)}
                className="markdown-link"
              >
                {segment.url}
              </a>
            );
          default:
            return <span key={i}>{segment.content}</span>;
        }
      })}
    </span>
  );
}
