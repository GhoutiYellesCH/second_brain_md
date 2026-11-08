import React, { useState } from 'react';
import { FileItem } from '../../types';
import {
  Folder,
  FolderOpen,
  FileText,
  Code,
  Image as ImageIcon,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  Trash2,
  Edit2,
} from 'lucide-react';
import { getFileKind } from '../../services/codeLanguages';

interface FileTreeItemProps {
  item: FileItem;
  activePath?: string;
  onSelectFile: (path: string) => void;
  onDelete: (path: string) => void;
  onRename: (oldPath: string, newPath: string) => void;
  level?: number;
}

export const FileTreeItem: React.FC<FileTreeItemProps> = ({
  item,
  activePath,
  onSelectFile,
  onDelete,
  onRename,
  level = 0,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(item.name);
  const [showMenu, setShowMenu] = useState(false);

  const isSelected = activePath === item.path;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.isDir) {
      setIsOpen(!isOpen);
    } else {
      onSelectFile(item.path);
    }
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && newName !== item.name) {
      const parentDir = item.path.substring(0, item.path.lastIndexOf('/'));
      const newPath = `${parentDir}/${newName.trim()}`;
      onRename(item.path, newPath);
    }
    setIsRenaming(false);
  };

  const getItemIcon = () => {
    if (item.isDir) {
      return isOpen ? (
        <FolderOpen className="w-4 h-4 text-[#7aa2f7] shrink-0" />
      ) : (
        <Folder className="w-4 h-4 text-[#7aa2f7]/80 shrink-0" />
      );
    }
    const kind = getFileKind(item.name);
    if (kind === 'code') {
      return <Code className="w-4 h-4 text-[#73daca] shrink-0" />;
    }
    if (kind === 'asset') {
      return <ImageIcon className="w-4 h-4 text-[#ff9e64] shrink-0" />;
    }
    return <FileText className="w-4 h-4 text-[#7aa2f7]/90 shrink-0" />;
  };

  return (
    <div className="select-none text-xs">
      <div
        onClick={handleToggle}
        style={{ paddingLeft: `${Math.max(6, level * 14)}px` }}
        className={`group flex items-center justify-between py-1 pr-2 rounded cursor-pointer transition-colors ${
          isSelected
            ? 'bg-[#24283b] text-[#c0caf5] font-medium'
            : 'text-[#9aa5ce] hover:bg-[#1a1b26] hover:text-[#c0caf5]'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {item.isDir ? (
            <span className="text-[#565f89] hover:text-[#c0caf5] p-0.5">
              {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </span>
          ) : (
            <span className="w-3" />
          )}

          {getItemIcon()}

          {isRenaming ? (
            <form onSubmit={handleRenameSubmit} onClick={(e) => e.stopPropagation()} className="flex-1">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRenameSubmit}
                autoFocus
                className="w-full bg-[#16161e] border border-[#7aa2f7] rounded px-1.5 py-0.5 text-xs text-[#c0caf5] outline-none"
              />
            </form>
          ) : (
            <span className="truncate flex-1" title={item.name}>
              {item.name}
            </span>
          )}
        </div>

        {/* Action button */}
        {!isRenaming && (
          <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded hover:bg-[#1f2335] text-[#565f89] hover:text-[#c0caf5]"
            >
              <MoreVertical className="w-3 h-3" />
            </button>

            {showMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-1 w-32 bg-[#1f2335] border border-[#24283b] rounded shadow-xl py-1 z-50 text-[11px]"
              >
                <button
                  onClick={() => {
                    setIsRenaming(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1 hover:bg-[#24283b] text-[#c0caf5] flex items-center gap-1.5"
                >
                  <Edit2 className="w-3 h-3 text-[#7aa2f7]" /> Rename
                </button>
                <button
                  onClick={() => {
                    onDelete(item.path);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1 hover:bg-[#24283b] text-[#f7768e] flex items-center gap-1.5"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {item.isDir && isOpen && item.children && (
        <div>
          {item.children.map((child) => (
            <FileTreeItem
              key={child.path}
              item={child}
              activePath={activePath}
              onSelectFile={onSelectFile}
              onDelete={onDelete}
              onRename={onRename}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
