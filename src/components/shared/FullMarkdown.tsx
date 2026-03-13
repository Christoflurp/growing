import { openUrl } from "@tauri-apps/plugin-opener";

interface FullMarkdownProps {
  content: string;
  className?: string;
}

function handleLinkClick(e: React.MouseEvent, url: string) {
  e.preventDefault();
  e.stopPropagation();
  openUrl(url);
}

function renderInline(text: string): React.ReactNode[] {
  const segments: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|__(.+?)__|`([^`]+)`|\*(.+?)\*|_(.+?)_|\[([^\]]+)\]\(([^)]+)\)|(https?:\/\/[^\s<>[\]()]+))/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
    }

    if (match[2] || match[3]) {
      segments.push(<strong key={key++}>{match[2] || match[3]}</strong>);
    } else if (match[4]) {
      segments.push(<code key={key++} className="md-inline-code">{match[4]}</code>);
    } else if (match[5] || match[6]) {
      segments.push(<em key={key++}>{match[5] || match[6]}</em>);
    } else if (match[7] && match[8]) {
      segments.push(
        <a key={key++} href={match[8]} onClick={(e) => handleLinkClick(e, match![8])} className="markdown-link">
          {match[7]}
        </a>
      );
    } else if (match[9]) {
      segments.push(
        <a key={key++} href={match[9]} onClick={(e) => handleLinkClick(e, match![9])} className="markdown-link">
          {match[9]}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  }

  return segments.length > 0 ? segments : [<span key={0}>{text}</span>];
}

interface BlockNode {
  type: "heading" | "paragraph" | "code" | "blockquote" | "list" | "hr" | "mermaid";
  level?: number;
  lang?: string;
  content?: string;
  ordered?: boolean;
  items?: string[];
}

function parseBlocks(content: string): BlockNode[] {
  const lines = content.split("\n");
  const blocks: BlockNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      if (lang === "mermaid") {
        blocks.push({ type: "mermaid", content: codeLines.join("\n") });
      } else {
        blocks.push({ type: "code", lang: lang || undefined, content: codeLines.join("\n") });
      }
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|_{3,}|\*{3,})\s*$/.test(line)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      blocks.push({ type: "heading", level: headingMatch[1].length, content: headingMatch[2] });
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ") || line === ">") {
      const quoteLines: string[] = [];
      while (i < lines.length && (lines[i].startsWith("> ") || lines[i] === ">")) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "blockquote", content: quoteLines.join("\n") });
      continue;
    }

    // Unordered list
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s+/, ""));
        i++;
      }
      blocks.push({ type: "list", ordered: false, items });
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "list", ordered: true, items });
      continue;
    }

    // Empty lines
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph (collect consecutive non-empty lines)
    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("#") && !lines[i].startsWith("```") && !lines[i].startsWith("> ") && !/^\s*[-*+]\s+/.test(lines[i]) && !/^\s*\d+\.\s+/.test(lines[i]) && !/^(-{3,}|_{3,}|\*{3,})\s*$/.test(lines[i])) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: "paragraph", content: paraLines.join("\n") });
    }
  }

  return blocks;
}

export function FullMarkdown({ content, className }: FullMarkdownProps) {
  const blocks = parseBlocks(content);

  return (
    <div className={`full-markdown ${className || ""}`}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading": {
            const content = renderInline(block.content || "");
            if (block.level === 1) return <h1 key={i}>{content}</h1>;
            if (block.level === 2) return <h2 key={i}>{content}</h2>;
            if (block.level === 3) return <h3 key={i}>{content}</h3>;
            if (block.level === 4) return <h4 key={i}>{content}</h4>;
            if (block.level === 5) return <h5 key={i}>{content}</h5>;
            return <h6 key={i}>{content}</h6>;
          }
          case "paragraph":
            return <p key={i}>{renderInline(block.content || "")}</p>;
          case "code":
            return (
              <pre key={i} className="md-code-block">
                {block.lang && <span className="md-code-lang">{block.lang}</span>}
                <code>{block.content}</code>
              </pre>
            );
          case "mermaid":
            return (
              <pre key={i} className="md-code-block">
                <span className="md-code-lang">mermaid</span>
                <code>{block.content}</code>
              </pre>
            );
          case "blockquote":
            return (
              <blockquote key={i} className="md-blockquote">
                {renderInline(block.content || "")}
              </blockquote>
            );
          case "list":
            if (block.ordered) {
              return (
                <ol key={i}>
                  {block.items?.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
                </ol>
              );
            }
            return (
              <ul key={i}>
                {block.items?.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
              </ul>
            );
          case "hr":
            return <hr key={i} className="md-hr" />;
          default:
            return null;
        }
      })}
    </div>
  );
}
