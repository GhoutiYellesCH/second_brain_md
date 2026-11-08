import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Home, ExternalLink, Globe, Bookmark } from 'lucide-react';
import { isTauri } from '../services/vaultApi';

interface BrowserViewProps {
  initialUrl?: string;
  onUrlChange?: (url: string) => void;
}

export const BrowserView: React.FC<BrowserViewProps> = ({
  initialUrl = 'https://en.wikipedia.org/wiki/Second_brain',
  onUrlChange,
}) => {
  const [url, setUrl] = useState<string>(initialUrl);
  const [currentUrl, setCurrentUrl] = useState<string>(initialUrl);
  const [history, setHistory] = useState<string[]>([initialUrl]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [key, setKey] = useState<number>(0);

  const quickLinks = [
    { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Second_brain' },
    { name: 'MDN Web Docs', url: 'https://developer.mozilla.org/' },
    { name: 'Rust Docs', url: 'https://doc.rust-lang.org/book/' },
    { name: 'Tauri Guide', url: 'https://tauri.app/' },
    { name: 'DuckDuckGo', url: 'https://duckduckgo.com/' },
  ];

  const navigateTo = (newUrl: string) => {
    let formatted = newUrl.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      if (formatted.includes('.') && !formatted.includes(' ')) {
        formatted = `https://${formatted}`;
      } else {
        formatted = `https://duckduckgo.com/?q=${encodeURIComponent(formatted)}`;
      }
    }
    setUrl(formatted);
    setCurrentUrl(formatted);
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(formatted);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    setKey((prev) => prev + 1);
    onUrlChange?.(formatted);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigateTo(url);
    }
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setUrl(prev);
      setCurrentUrl(prev);
      setKey((k) => k + 1);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setUrl(next);
      setCurrentUrl(next);
      setKey((k) => k + 1);
    }
  };

  const reload = () => {
    setKey((k) => k + 1);
  };

  const openInSystemBrowser = async () => {
    if (isTauri()) {
      try {
        const { openUrl } = await import('@tauri-apps/plugin-opener');
        await openUrl(currentUrl);
      } catch (e) {
        window.open(currentUrl, '_blank');
      }
    } else {
      window.open(currentUrl, '_blank');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#121215] text-zinc-200">
      {/* Browser Navigation Bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border-b border-zinc-800 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={goBack}
            disabled={historyIndex <= 0}
            className="p-1.5 hover:bg-zinc-800 disabled:opacity-30 rounded text-zinc-300"
            title="Back"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={goForward}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 hover:bg-zinc-800 disabled:opacity-30 rounded text-zinc-300"
            title="Forward"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={reload}
            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-300"
            title="Reload"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => navigateTo('https://en.wikipedia.org/wiki/Second_brain')}
            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-300"
            title="Home"
          >
            <Home className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* URL Bar */}
        <div className="flex-1 flex items-center bg-zinc-950 border border-zinc-800 focus-within:border-purple-500 rounded-lg px-2.5 py-1 text-xs transition-colors">
          <Globe className="w-3.5 h-3.5 text-zinc-500 mr-2 shrink-0" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search or enter web address..."
            className="flex-1 bg-transparent border-none outline-none text-zinc-200 font-mono text-xs"
          />
        </div>

        <button
          onClick={openInSystemBrowser}
          className="flex items-center gap-1 p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded text-xs transition-colors"
          title="Open in System Browser"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bookmarks Bar */}
      <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900/60 border-b border-zinc-800/80 text-[11px] overflow-x-auto">
        <Bookmark className="w-3 h-3 text-purple-400 shrink-0" />
        {quickLinks.map((ql) => (
          <button
            key={ql.name}
            onClick={() => navigateTo(ql.url)}
            className="hover:text-purple-300 text-zinc-400 px-2 py-0.5 rounded hover:bg-zinc-800 transition-colors whitespace-nowrap"
          >
            {ql.name}
          </button>
        ))}
      </div>

      {/* Browser iframe pane */}
      <div className="flex-1 relative bg-white">
        <iframe
          key={key}
          src={currentUrl}
          title="Synapse Browser View"
          className="w-full h-full border-none"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </div>
    </div>
  );
};
