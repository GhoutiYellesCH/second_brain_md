import React, { useState } from 'react';
import { AssetData } from '../types';
import { ZoomIn, ZoomOut, RotateCw, Copy, Check, FileText } from 'lucide-react';

interface AssetViewerProps {
  assetName: string;
  assetPath: string;
  assetData?: AssetData;
  onInsertIntoNote?: (wikilink: string) => void;
}

export const AssetViewer: React.FC<AssetViewerProps> = ({
  assetName,
  assetPath,
  assetData,
  onInsertIntoNote,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const ext = assetName.split('.').pop()?.toLowerCase() || '';
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp'].includes(ext);
  const isVideo = ['mp4', 'webm', 'mov'].includes(ext);
  const isAudio = ['mp3', 'wav', 'ogg', 'm4a'].includes(ext);
  const isPdf = ext === 'pdf';

  const dataUri = assetData ? `data:${assetData.mime_type};base64,${assetData.base64_data}` : '';

  const wikilink = `![[${assetName}]]`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(wikilink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="flex flex-col h-full bg-[#121215] select-none">
      {/* Top Asset Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/90 border-b border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-zinc-200 font-medium">{assetName}</span>
          {assetData && (
            <span className="text-zinc-500 text-[11px] bg-zinc-800 px-2 py-0.5 rounded">
              {formatSize(assetData.file_size)}
            </span>
          )}
          <span className="text-purple-400 font-mono text-[11px] uppercase bg-purple-950/40 border border-purple-800/40 px-1.5 py-0.5 rounded">
            {ext}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {isImage && (
            <>
              <button
                onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                className="p-1.5 hover:bg-zinc-800 text-zinc-300 rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
                className="p-1.5 hover:bg-zinc-800 text-zinc-300 rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-1.5 hover:bg-zinc-800 text-zinc-300 rounded"
                title="Rotate"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded font-medium transition-colors"
            title="Copy Wikilink"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied Wikilink' : 'Copy Link'}</span>
          </button>

          {onInsertIntoNote && (
            <button
              onClick={() => onInsertIntoNote(wikilink)}
              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded font-medium transition-colors"
            >
              Insert into Note
            </button>
          )}
        </div>
      </div>

      {/* Main Asset Canvas / Viewer */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-[#0d0d10] relative">
        {isImage && (
          <div
            className="transition-transform duration-150 ease-out flex items-center justify-center"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
          >
            <img
              src={dataUri || '#'}
              alt={assetName}
              className="max-h-[75vh] max-w-[85vw] object-contain rounded-lg shadow-2xl border border-zinc-800/80 bg-zinc-950/40"
            />
          </div>
        )}

        {isVideo && (
          <video
            controls
            src={dataUri}
            className="max-h-[75vh] max-w-[85vw] rounded-lg shadow-2xl border border-zinc-800"
          />
        )}

        {isAudio && (
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-md w-full shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-purple-900/30 text-purple-400 flex items-center justify-center mx-auto mb-4 border border-purple-700/40">
              🎵
            </div>
            <h3 className="font-semibold text-zinc-100 text-base mb-1">{assetName}</h3>
            <p className="text-xs text-zinc-400 mb-6 font-mono">{assetPath}</p>
            <audio controls src={dataUri} className="w-full" />
          </div>
        )}

        {isPdf && (
          <iframe
            src={dataUri}
            title={assetName}
            className="w-full h-full rounded-lg border border-zinc-800 bg-white"
          />
        )}

        {!isImage && !isVideo && !isAudio && !isPdf && (
          <div className="text-center p-8 bg-zinc-900 border border-zinc-800 rounded-xl max-w-md">
            <FileText className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
            <h3 className="font-semibold text-zinc-200 text-sm mb-1">{assetName}</h3>
            <p className="text-xs text-zinc-500 font-mono mb-4">{assetPath}</p>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-medium"
            >
              Copy Embed: {wikilink}
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-1.5 bg-zinc-950 border-t border-zinc-800/80 text-[11px] text-zinc-500 flex items-center justify-between font-mono">
        <span className="truncate max-w-md">{assetPath}</span>
        <span>{isImage ? `Zoom: ${Math.round(zoom * 100)}%` : ''}</span>
      </div>
    </div>
  );
};
