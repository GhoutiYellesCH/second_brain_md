import { marked } from 'marked';
import DOMPurify from 'dompurify';
import katex from 'katex';
import mermaid from 'mermaid';
import { HeadingItem } from '../types';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    darkMode: true,
    background: '#1a1b26',
    primaryColor: '#7aa2f7',
    primaryBorderColor: '#3d59a1',
    primaryTextColor: '#c0caf5',
    lineColor: '#7dcfff',
    secondaryColor: '#bb9af7',
    tertiaryColor: '#24283b',
  },
  securityLevel: 'loose',
});

// Configure marked
marked.setOptions({
  gfm: true,
  breaks: true,
});

export function extractWikilinks(content: string): string[] {
  const regex = /\[\[(.*?)\]\]/g;
  const links: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    const raw = match[1].split('|')[0].trim();
    if (raw && !raw.startsWith('#') && !links.includes(raw)) {
      links.push(raw);
    }
  }
  return links;
}

export function extractTags(content: string): string[] {
  const regex = /(?:^|\s)#([a-zA-Z0-9_\-\/]+)(?=\s|$|[.,;:!?])/g;
  const tags: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    const tag = match[1].trim();
    if (tag && !tags.includes(tag) && isNaN(Number(tag))) {
      tags.push(tag);
    }
  }
  return tags;
}

export function extractHeadings(content: string): HeadingItem[] {
  const lines = content.split('\n');
  const headings: HeadingItem[] = [];
  let inCode = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('```')) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;

    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].trim(),
        line: i + 1,
      });
    }
  }
  return headings;
}

export function renderMarkdown(content: string, designatedFolder: string = 'Attachments'): string {
  if (!content) return '';

  let processed = content;

  // 1. Math formulas: block math $$...$$
  const mathBlocks: string[] = [];
  processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    try {
      const rendered = katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false,
      });
      const placeholder = `%%MATH_BLOCK_${mathBlocks.length}%%`;
      mathBlocks.push(rendered);
      return placeholder;
    } catch {
      return `<code>${math}</code>`;
    }
  });

  // 2. Math formulas: inline math $...$
  const mathInlines: string[] = [];
  processed = processed.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    try {
      const rendered = katex.renderToString(math.trim(), {
        displayMode: false,
        throwOnError: false,
      });
      const placeholder = `%%MATH_INLINE_${mathInlines.length}%%`;
      mathInlines.push(rendered);
      return placeholder;
    } catch {
      return `<code>${math}</code>`;
    }
  });

  // 3. Wikilinks: [[Target|Label]] and [[Target]]
  processed = processed.replace(/\[\[(.*?)\]\]/g, (_, inner) => {
    const parts = inner.split('|');
    const target = parts[0].trim();
    const alias = parts[1] ? parts[1].trim() : target;
    return `<a class="wikilink text-[#7aa2f7] hover:text-[#7dcfff] underline underline-offset-4 decoration-[#7aa2f7]/50 hover:decoration-[#7dcfff] cursor-pointer font-medium" data-target="${target}">${alias}</a>`;
  });

  // 4. Tags: #tag
  processed = processed.replace(/(^|\s)#([a-zA-Z0-9_\-\/]+)(?=\s|$|[.,;:!?])/g, '$1<span class="inline-tag bg-[#24283b] text-[#7aa2f7] px-1.5 py-0.5 rounded text-xs font-mono font-medium border border-[#414868]/60 cursor-pointer hover:border-[#7aa2f7]/70" data-tag="$2">#$2</span>');

  // 5. Callouts: > [!NOTE], > [!TIP], > [!WARNING], > [!IMPORTANT], > [!CAUTION]
  processed = processed.replace(/^>\s*\[!([A-Z]+)\]\s*(.*)$/gim, (_, type, title) => {
    const t = type.toUpperCase();
    let border = 'border-[#7aa2f7] bg-[#7aa2f7]/10 text-[#7aa2f7]';
    if (t === 'WARNING' || t === 'CAUTION') border = 'border-[#f7768e] bg-[#f7768e]/10 text-[#f7768e]';
    if (t === 'TIP' || t === 'SUCCESS') border = 'border-[#73daca] bg-[#73daca]/10 text-[#73daca]';
    if (t === 'IMPORTANT') border = 'border-[#bb9af7] bg-[#bb9af7]/10 text-[#bb9af7]';

    return `<div class="callout my-3 p-3.5 rounded-lg border-l-4 ${border}"><div class="font-semibold text-sm mb-1 uppercase tracking-wider flex items-center gap-1.5">${t}: ${title || t}</div><div class="callout-content text-sm text-[#c0caf5]">`;
  });

  // Convert marked HTML
  let rawHtml = marked.parse(processed) as string;

  // Restore Math Blocks and Inlines
  mathBlocks.forEach((rendered, idx) => {
    rawHtml = rawHtml.replace(`%%MATH_BLOCK_${idx}%%`, `<div class="katex-block my-3 overflow-x-auto text-center">${rendered}</div>`);
  });
  mathInlines.forEach((rendered, idx) => {
    rawHtml = rawHtml.replace(`%%MATH_INLINE_${idx}%%`, rendered);
  });

  // Sanitize with DOMPurify
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    ADD_TAGS: ['math', 'mrow', 'mi', 'mo', 'mn', 'annotation', 'semantics', 'svg', 'g', 'path', 'circle', 'line', 'text', 'rect'],
    ADD_ATTR: ['target', 'data-target', 'data-tag', 'xmlns', 'viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'd', 'cx', 'cy', 'r', 'x', 'y', 'width', 'height', 'checked', 'disabled', 'type', 'class'],
  });

  return cleanHtml;
}
