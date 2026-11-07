import { marked } from 'marked';
import katex from 'katex';
import Prism from 'prismjs';
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

export interface ParsedMarkdownResult {
  html: string;
  headings: HeadingItem[];
  outgoingLinks: string[];
  tags: string[];
}

export function extractTags(markdown: string): string[] {
  const tagRegex = /(?:^|\s)#([a-zA-Z0-9_\-\/]+)(?=\s|$|[.,;:!?])/g;
  const tags = new Set<string>();
  let match;
  while ((match = tagRegex.exec(markdown)) !== null) {
    // Avoid markdown headers like # Heading
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
    // Ignore asset embeds ![[...]]
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
  const vault = settings.vaultPath.replace(/\/+$/, '');
  const noteDir = currentNotePath.includes('/') ? currentNotePath.substring(0, currentNotePath.lastIndexOf('/')) : vault;

  switch (settings.assetsMode) {
    case 'designated': {
      const folder = settings.designatedFolder.replace(/^\/+|\/+$/g, '');
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

  // 1. Preprocess Math: block $$...$$ and inline $...$
  let processed = markdown;

  // Block math
  processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    try {
      const rendered = katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
      return `<div class="katex-block my-4 overflow-x-auto text-center">${rendered}</div>`;
    } catch {
      return `<pre class="katex-error text-red-400">$$\n${math}\n$$</pre>`;
    }
  });

  // Inline math (avoid matching standalone currency signs like $10 or $20)
  processed = processed.replace(/(?<!\\)\$([^\$\n]+?)\$/g, (_, math) => {
    try {
      const rendered = katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
      return `<span class="katex-inline">${rendered}</span>`;
    } catch {
      return `$${math}$`;
    }
  });

  // 2. Preprocess Asset Embeds ![[filename|width]]
  processed = processed.replace(/!\[\[(.*?)\]\]/g, (_, raw) => {
    const parts = raw.split('|');
    const assetName = parts[0].trim();
    const width = parts[1] ? parts[1].trim() : '';

    const ext = assetName.split('.').pop()?.toLowerCase() || '';
    const resolvedPath = resolveAssetPath(assetName, currentNotePath, settings);
    const dataSrc = assetUrlMap[resolvedPath] || assetUrlMap[assetName] || '';

    const widthStyle = width ? `style="max-width: ${width}px;"` : '';

    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) {
      return `<div class="asset-embed-container my-3 rounded-lg overflow-hidden border border-zinc-700/60 bg-zinc-900/60 p-2 inline-block">
        <img src="${dataSrc || '#'}" alt="${assetName}" data-asset-path="${resolvedPath}" class="vault-asset-img max-h-96 rounded object-contain cursor-pointer hover:opacity-95 transition-opacity" ${widthStyle} />
        <div class="text-xs text-zinc-400 mt-1 flex items-center justify-between">
          <span class="truncate font-mono">${assetName}</span>
          <span class="text-purple-400 text-[10px] uppercase font-semibold">Asset</span>
        </div>
      </div>`;
    } else if (['mp4', 'webm'].includes(ext)) {
      return `<div class="asset-embed-container my-3">
        <video controls src="${dataSrc}" class="rounded-lg max-h-80 border border-zinc-700" ${widthStyle}></video>
        <div class="text-xs text-zinc-400 mt-1">${assetName}</div>
      </div>`;
    } else if (['mp3', 'wav', 'ogg'].includes(ext)) {
      return `<div class="asset-embed-container my-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
        <div class="text-xs text-zinc-300 mb-2 font-mono">🎵 ${assetName}</div>
        <audio controls src="${dataSrc}" class="w-full"></audio>
      </div>`;
    } else if (ext === 'pdf') {
      return `<div class="asset-embed-container my-3 p-3 bg-zinc-900/80 rounded-lg border border-zinc-700 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-red-400 font-bold">📄 PDF</span>
          <span class="text-sm text-zinc-200 font-mono">${assetName}</span>
        </div>
        <button class="open-asset-btn px-2.5 py-1 text-xs bg-purple-600 hover:bg-purple-500 text-white rounded font-medium" data-asset-path="${resolvedPath}">Open PDF Reader</button>
      </div>`;
    } else {
      return `<div class="asset-embed-container my-2 p-2.5 bg-zinc-900 rounded border border-zinc-800 flex items-center gap-2 text-sm text-zinc-300">
        <span>📎</span>
        <span class="font-mono">${assetName}</span>
      </div>`;
    }
  });

  // 3. Preprocess Wikilinks [[Target|Label]]
  processed = processed.replace(/\[\[(.*?)\]\]/g, (_, raw) => {
    const parts = raw.split('|');
    const target = parts[0].trim();
    const label = parts[1] ? parts[1].trim() : target;
    return `<a href="#wikilink-${encodeURIComponent(target)}" class="obsidian-wikilink text-purple-400 hover:text-purple-300 hover:underline font-medium cursor-pointer" data-wikilink="${target}">${label}</a>`;
  });

  // 4. Preprocess Callouts: > [!NOTE] Title
  const calloutRegex = /^>\s*\[!([a-zA-Z]+)\]\s*(.*)$/gm;
  processed = processed.replace(calloutRegex, (_, type, title) => {
    const t = type.toUpperCase();
    const displayTitle = title.trim() || type.toUpperCase();
    return `:::callout-${t}:::${displayTitle}:::`;
  });

  // 5. Configure marked parser
  const renderer = new marked.Renderer();

  // Custom code renderer with syntax highlighting and copy button
  renderer.code = function ({ text, lang }) {
    if (lang === 'mermaid') {
      return `<div class="mermaid-diagram my-4 p-4 rounded-lg bg-zinc-900/90 border border-zinc-800 text-center font-mono text-sm overflow-x-auto" data-code="${encodeURIComponent(text)}">
        <div class="text-xs text-purple-400 font-semibold mb-2 flex items-center justify-between border-b border-zinc-800 pb-1">
          <span>Mermaid Diagram</span>
          <span class="text-zinc-500 text-[10px]">Graph Mode</span>
        </div>
        <div class="mermaid-content flex justify-center py-2">${text}</div>
      </div>`;
    }

    const language = lang && Prism.languages[lang] ? lang : 'markdown';
    const highlighted = Prism.languages[language]
      ? Prism.highlight(text, Prism.languages[language], language)
      : text;

    return `<div class="code-block-container my-3 rounded-lg overflow-hidden border border-zinc-800 bg-[#141416]">
      <div class="flex items-center justify-between px-3 py-1.5 bg-zinc-900/80 text-xs text-zinc-400 border-b border-zinc-800 font-mono">
        <span>${lang || 'text'}</span>
        <button class="copy-code-btn hover:text-white px-2 py-0.5 rounded text-[11px] bg-zinc-800/80 hover:bg-zinc-700 transition-colors" data-code="${encodeURIComponent(text)}">Copy</button>
      </div>
      <pre class="p-3 overflow-x-auto text-sm font-mono leading-relaxed text-zinc-200"><code>${highlighted}</code></pre>
    </div>`;
  };

  // Custom heading renderer with anchor IDs
  renderer.heading = function ({ tokens, depth }) {
    const text = tokens.map((t: any) => t.raw || '').join('');
    const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    return `<h${depth} id="${id}" class="heading-anchor group relative scroll-mt-6 font-bold tracking-tight text-zinc-100 my-3">
      <span class="absolute -left-5 opacity-0 group-hover:opacity-60 text-zinc-500 font-mono text-sm select-none">#</span>
      ${text}
    </h${depth}>`;
  };

  // Checkbox task lists
  renderer.listitem = function (item) {
    if (item.task) {
      return `<li class="task-list-item flex items-start gap-2.5 my-1.5 list-none">
        <input type="checkbox" ${item.checked ? 'checked' : ''} class="mt-1 w-4 h-4 rounded accent-purple-500 bg-zinc-800 border-zinc-700 cursor-pointer" />
        <span class="${item.checked ? 'line-through text-zinc-500' : 'text-zinc-200'}">${item.text}</span>
      </li>`;
    }
    return `<li class="my-1 text-zinc-200">${item.text}</li>`;
  };

  // Tag styling (#tag)
  renderer.text = function ({ text }) {
    // Replace hashtags with interactive badge
    return text.replace(/(?:^|\s)#([a-zA-Z0-9_\-\/]+)(?=\s|$|[.,;:!?])/g, (_, tag) => {
      return ` <span class="obsidian-tag inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-950/60 text-purple-300 border border-purple-800/50 cursor-pointer hover:bg-purple-900/80 transition-colors" data-tag="${tag}">#${tag}</span>`;
    });
  };

  marked.setOptions({
    gfm: true,
    breaks: true,
    renderer,
  });

  let rawHtml = marked.parse(processed) as string;

  // Post-process Callout markers
  rawHtml = rawHtml.replace(/:::callout-([A-Z]+):::(.*?):::\n?([\s\S]*?)(?=(:::callout-|$|<\/blockquote>))/g, (_, type, title, body) => {
    const colors: Record<string, { border: string; bg: string; text: string; icon: string }> = {
      NOTE: { border: 'border-blue-500/80', bg: 'bg-blue-950/20', text: 'text-blue-400', icon: 'ℹ️' },
      TIP: { border: 'border-purple-500/80', bg: 'bg-purple-950/20', text: 'text-purple-400', icon: '💡' },
      WARNING: { border: 'border-amber-500/80', bg: 'bg-amber-950/20', text: 'text-amber-400', icon: '⚠️' },
      IMPORTANT: { border: 'border-indigo-500/80', bg: 'bg-indigo-950/20', text: 'text-indigo-400', icon: '📌' },
      DANGER: { border: 'border-rose-500/80', bg: 'bg-rose-950/20', text: 'text-rose-400', icon: '🔥' },
      CAUTION: { border: 'border-red-500/80', bg: 'bg-red-950/20', text: 'text-red-400', icon: '🛑' },
      SUCCESS: { border: 'border-emerald-500/80', bg: 'bg-emerald-950/20', text: 'text-emerald-400', icon: '✅' },
      QUOTE: { border: 'border-zinc-500/80', bg: 'bg-zinc-900/40', text: 'text-zinc-400', icon: '💬' },
    };
    const c = colors[type] || colors.NOTE;

    return `<div class="obsidian-callout my-4 rounded-r-lg border-l-4 ${c.border} ${c.bg} p-3.5 shadow-sm">
      <div class="flex items-center gap-2 font-semibold text-sm ${c.text} mb-1.5">
        <span>${c.icon}</span>
        <span>${title}</span>
      </div>
      <div class="text-sm text-zinc-300 leading-relaxed pl-6 space-y-1">
        ${body}
      </div>
    </div>`;
  });

  return {
    html: rawHtml,
    headings,
    outgoingLinks,
    tags,
  };
}
