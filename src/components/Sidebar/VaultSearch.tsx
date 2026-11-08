import React, { useState, useEffect } from 'react';
import { SearchResult } from '../../types';
import { vaultApi } from '../../services/vaultApi';
import { Search, Loader2, FileText } from 'lucide-react';

interface VaultSearchProps {
  vaultPath: string;
  onSelectResult: (path: string, line: number) => void;
}

export const VaultSearch: React.FC<VaultSearchProps> = ({ vaultPath, onSelectResult }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim() || !vaultPath) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await vaultApi.searchVault(vaultPath, query);
        setResults(res);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, vaultPath]);

  return (
    <div className="flex flex-col h-full text-xs">
      {/* Search Input */}
      <div className="p-2 border-b border-[#24283b]">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-[#565f89] absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes and code..."
            className="w-full bg-[#16161e] border border-[#24283b] focus:border-[#7aa2f7] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#c0caf5] placeholder-[#565f89] outline-none transition-colors"
            autoFocus
          />
          {loading && <Loader2 className="w-3.5 h-3.5 text-[#7aa2f7] animate-spin absolute right-2.5" />}
        </div>
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {results.length > 0 ? (
          <>
            <div className="text-[10px] text-[#565f89] uppercase tracking-wider px-1 font-semibold">
              {results.length} Matches Found
            </div>
            {results.map((r, idx) => (
              <div
                key={`${r.path}-${r.lineNumber}-${idx}`}
                onClick={() => onSelectResult(r.path, r.lineNumber || r.line_number || 1)}
                className="p-2 rounded bg-[#16161e]/60 hover:bg-[#24283b] cursor-pointer transition-colors border border-[#24283b]/60"
              >
                <div className="flex items-center gap-1.5 font-medium text-[#7aa2f7] text-xs">
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{r.title}</span>
                  <span className="text-[10px] text-[#565f89] ml-auto">:{r.lineNumber}</span>
                </div>
                <div className="text-[11px] text-[#a9b1d6] mt-1 font-mono truncate pl-5">
                  {r.snippet}
                </div>
              </div>
            ))}
          </>
        ) : query.trim() ? (
          !loading && (
            <div className="text-center py-8 text-[#565f89]">
              No matches found for &quot;{query}&quot;
            </div>
          )
        ) : (
          <div className="text-center py-8 text-[#565f89]">
            Type to search throughout your vault
          </div>
        )}
      </div>
    </div>
  );
};
