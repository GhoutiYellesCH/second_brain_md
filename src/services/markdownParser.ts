import { marked } from 'marked';
import DOMPurify from 'dompurify';
import katex from 'katex';
import mermaid from 'mermaid';
import 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-css';
import { HeadingItem, VaultSettings } from '../types';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    darkMode: true,
    background: '#16161e',
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

export interface ParsedMarkdownResult {
  html: string;
  headings: HeadingItem[];
  outgoingLinks: string[];
  tags: string[];
}

export function isArabicOrRtlText(text: string): boolean {
  if (!text) return false;
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
}

export function extractTags(markdown: string): string[] {
  const tagRegex = /(?:^|\s)#([a-zA-Z0-9_\-\/]+)(?=\s|$|[.,;:!?])/g;
  const tags = new Set<string>();
  let match;
  while ((match = tagRegex.exec(markdown)) !== null) {
    const fullMatch = match[0];
    if (!fullMatch.trim().startsWith('# ') && !fullMatch.trim().startsWith('##')) {
      tags.add(match[1]);
    }
  }
  return Array.from(tags);
}

export function extractWikilinks(markdown: string): string[] {
  const wikilinkRegex = /\[\[(.*?)\]\]/g;
  const links = new Set<string>();
  let match;
  while ((match = wikilinkRegex.exec(markdown)) !== null) {
    const raw = match[1];
    const index = match.index;
    if (index > 0 && markdown[index - 1] === '!') {
      continue;
    }
    const target = raw.split('|')[0].trim();
    if (target) {
      links.add(target);
    }
  }
  return Array.from(links);
}

export function extractHeadings(markdown: string): HeadingItem[] {
  const headings: HeadingItem[] = [];
  const lines = markdown.split('\n');
  lines.forEach((line, idx) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      headings.push({ level, text, id, line: idx + 1 });
    }
  });
  return headings;
}

export function resolveAssetPath(
  assetName: string,
  currentNotePath: string,
  settings: VaultSettings
): string {
  const vault = (settings.vaultPath || '').replace(/\/+$/, '');
  const noteDir = currentNotePath.includes('/')
    ? currentNotePath.substring(0, currentNotePath.lastIndexOf('/'))
    : vault;

  switch (settings.assetsMode) {
    case 'designated': {
      const folder = (settings.designatedFolder || 'Attachments').replace(/^\/+|\/+$/g, '');
      return `${vault}/${folder}/${assetName}`;
    }
    case 'root':
      return `${vault}/${assetName}`;
    case 'same-folder':
      return `${noteDir}/${assetName}`;
    case 'subfolder':
      return `${noteDir}/assets/${assetName}`;
    default:
      return `${vault}/assets/${assetName}`;
  }
}

export function parseMarkdown(
  markdown: string,
  currentNotePath: string,
  settings: VaultSettings,
  assetUrlMap: Record<string, string> = {}
): ParsedMarkdownResult {
  const headings = extractHeadings(markdown);
  const outgoingLinks = extractWikilinks(markdown);
  const tags = extractTags(markdown);

  if (!markdown) {
    return { html: '', headings, outgoingLinks, tags };
  }

  let processed = markdown;

  // 1. Math block $$...$$
  const mathBlocks: string[] = [];
  processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    try {
      const rendered = katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
      const placeholder = `%%SYNAPSE_MATH_BLOCK_${mathBlocks.length}%%`;
      mathBlocks.push(rendered);
      return placeholder;
    } catch {
      return `<code>${math}</code>`;
    }
  });

  // 2. Math inline $...$
  const mathInlines: string[] = [];
  processed = processed.replace(/(?<!\\)\$([^\$\n]+?)\$/g, (_, math) => {
    try {
      const rendered = katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
      const placeholder = `%%SYNAPSE_MATH_INLINE_${mathInlines.length}%%`;
      mathInlines.push(rendered);
      return placeholder;
    } catch {
      return `<code>${math}</code>`;
    }
  });

  // 3. Asset Embeds ![[filename|width]]
  processed = processed.replace(/!\[\[(.*?)\]\]/g, (_, raw) => {
    const parts = raw.split('|');
    const assetName = parts[0].trim();
    const width = parts[1] ? parts[1].trim() : '';

    const ext = assetName.split('.').pop()?.toLowerCase() || '';
    const resolvedPath = resolveAssetPath(assetName, currentNotePath, settings);
    const dataSrc = assetUrlMap[resolvedPath] || assetUrlMap[assetName] || '';
    const widthStyle = width ? `style="max-width: ${width}px;"` : '';

    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) {
      return `<div class="asset-embed-container my-3 rounded-lg overflow-hidden border border-[#24283b] bg-[#1f2335]/60 p-2 inline-block">
        <img src="${dataSrc || '#'}" alt="${assetName}" data-asset-path="${resolvedPath}" class="vault-asset-img max-h-96 rounded object-contain cursor-pointer hover:opacity-95 transition-opacity" ${widthStyle} />
        <div class="text-xs text-[#787c99] mt-1 flex items-center justify-between">
          <span class="truncate font-mono">${assetName}</span>
          <span class="text-[#7aa2f7] text-[10px] uppercase font-semibold">Asset</span>
        </div>
      </div>`;
    }

    if (ext === 'pdf') {
      return `<div class="pdf-embed-box my-3 p-3 rounded-lg bg-[#1f2335] border border-[#24283b] flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-red-400 font-bold text-xs uppercase">PDF</span>
          <span class="font-mono text-xs text-[#c0caf5]">${assetName}</span>
        </div>
        <button class="open-asset-btn px-2.5 py-1 bg-[#24283b] hover:bg-[#3d59a1] text-[#7aa2f7] rounded text-xs transition-colors" data-asset-path="${resolvedPath}">
          Open PDF
        </button>
      </div>`;
    }

    if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) {
      return `<div class="audio-embed-box my-3 p-3 rounded-lg bg-[#1f2335] border border-[#24283b]">
        <div class="font-mono text-xs text-[#787c99] mb-1.5">${assetName}</div>
        <audio controls src="${dataSrc}" class="w-full h-8"></audio>
      </div>`;
    }

    if (['mp4', 'webm', 'mov'].includes(ext)) {
      return `<div class="video-embed-box my-3 p-2 rounded-lg bg-[#1f2335] border border-[#24283b]">
        <video controls src="${dataSrc}" class="w-full max-h-96 rounded"></video>
      </div>`;
    }

    return `<a class="open-asset-btn text-[#7aa2f7] hover:underline" data-asset-path="${resolvedPath}">${assetName}</a>`;
  });

  // 4. Wikilinks [[target|label]] and [[target]]
  processed = processed.replace(/\[\[(.*?)\]\]/g, (_, inner) => {
    const parts = inner.split('|');
    const target = parts[0].trim();
    const alias = parts[1] ? parts[1].trim() : target;
    return `<a class="synapse-wikilink wikilink text-[#7aa2f7] hover:text-[#7dcfff] underline underline-offset-4 decoration-[#7aa2f7]/50 hover:decoration-[#7dcfff] cursor-pointer font-medium" data-wikilink="${target}" data-target="${target}">${alias}</a>`;
  });

  // 5. Callouts > [!NOTE], > [!TIP], > [!WARNING], > [!IMPORTANT]
  processed = processed.replace(/^>\s*\[!([A-Z]+)\]\s*(.*)$/gim, (_, type, title) => {
    const t = type.toUpperCase();
    let border = 'border-[#7aa2f7] bg-[#7aa2f7]/10 text-[#7aa2f7]';
    if (t === 'WARNING' || t === 'CAUTION') border = 'border-[#f7768e] bg-[#f7768e]/10 text-[#f7768e]';
    if (t === 'TIP' || t === 'SUCCESS') border = 'border-[#73daca] bg-[#73daca]/10 text-[#73daca]';
    if (t === 'IMPORTANT') border = 'border-[#bb9af7] bg-[#bb9af7]/10 text-[#bb9af7]';

    return `<div class="callout my-3 p-3.5 rounded-lg border-l-4 ${border}"><div class="font-semibold text-sm mb-1 uppercase tracking-wider flex items-center gap-1.5">${t}: ${title || t}</div><div class="callout-content text-sm text-[#c0caf5]">`;
  });

  // Marked parse
  let html = marked.parse(processed) as string;

  // Restore math placeholders
  mathBlocks.forEach((rendered, idx) => {
    html = html.replace(`%%SYNAPSE_MATH_BLOCK_${idx}%%`, `<div class="katex-block my-4 overflow-x-auto text-center">${rendered}</div>`);
  });
  mathInlines.forEach((rendered, idx) => {
    html = html.replace(`%%SYNAPSE_MATH_INLINE_${idx}%%`, rendered);
  });

  // Sanitize with DOMPurify
  const cleanHtml = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true, svg: true, mathMl: true },
    ADD_TAGS: [
      'math', 'mrow', 'mi', 'mo', 'mn', 'annotation', 'semantics', 'span',
      'svg', 'g', 'path', 'circle', 'line', 'text', 'rect', 'video', 'audio', 'source', 'input'
    ],
    ADD_ATTR: [
      'target', 'data-wikilink', 'data-target', 'data-tag', 'data-asset-path', 'data-code',
      'xmlns', 'viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
      'd', 'cx', 'cy', 'r', 'x', 'y', 'width', 'height', 'controls', 'src', 'alt', 'type', 'checked', 'class', 'style'
    ],
  });

  return {
    html: cleanHtml,
    headings,
    outgoingLinks,
    tags,
  };
}

export function renderMarkdown(content: string, designatedFolder: string = 'Attachments'): string {
  const dummySettings: VaultSettings = {
    vaultPath: '',
    assetsMode: 'designated',
    designatedFolder,
    defaultViewMode: 'split',
    theme: 'tokyo-night',
    fontSize: 15,
  };
  return parseMarkdown(content, '', dummySettings).html;
}
