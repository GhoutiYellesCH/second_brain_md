import { FileKind } from '../types';

export interface LanguageInfo {
  id: string;
  name: string;
  extensions: string[];
  prismGrammar: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { id: 'python', name: 'Python', extensions: ['py', 'pyw'], prismGrammar: 'python' },
  { id: 'javascript', name: 'JavaScript', extensions: ['js', 'mjs', 'cjs'], prismGrammar: 'javascript' },
  { id: 'typescript', name: 'TypeScript', extensions: ['ts', 'mts', 'cts'], prismGrammar: 'typescript' },
  { id: 'tsx', name: 'TypeScript React', extensions: ['tsx'], prismGrammar: 'tsx' },
  { id: 'jsx', name: 'JavaScript React', extensions: ['jsx'], prismGrammar: 'jsx' },
  { id: 'rust', name: 'Rust', extensions: ['rs'], prismGrammar: 'rust' },
  { id: 'html', name: 'HTML', extensions: ['html', 'htm'], prismGrammar: 'html' },
  { id: 'css', name: 'CSS', extensions: ['css', 'scss', 'less'], prismGrammar: 'css' },
  { id: 'json', name: 'JSON', extensions: ['json'], prismGrammar: 'json' },
  { id: 'yaml', name: 'YAML', extensions: ['yaml', 'yml'], prismGrammar: 'yaml' },
  { id: 'toml', name: 'TOML', extensions: ['toml'], prismGrammar: 'toml' },
  { id: 'shell', name: 'Bash / Shell', extensions: ['sh', 'bash', 'zsh'], prismGrammar: 'bash' },
  { id: 'c', name: 'C', extensions: ['c', 'h'], prismGrammar: 'c' },
  { id: 'cpp', name: 'C++', extensions: ['cpp', 'cc', 'cxx', 'hpp'], prismGrammar: 'cpp' },
  { id: 'go', name: 'Go', extensions: ['go'], prismGrammar: 'go' },
  { id: 'sql', name: 'SQL', extensions: ['sql'], prismGrammar: 'sql' },
  { id: 'text', name: 'Plain Text', extensions: ['txt', 'log', 'env', 'conf', 'ini'], prismGrammar: 'clike' },
];

export const MARKDOWN_EXTENSIONS = new Set(['md', 'markdown', 'mdown', 'mkd']);
export const ASSET_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico',
  'pdf', 'mp3', 'wav', 'ogg', 'mp4', 'webm'
]);

export function getFileKind(filename: string): FileKind {
  const ext = getExtension(filename);
  if (MARKDOWN_EXTENSIONS.has(ext)) {
    return 'markdown';
  }
  if (ext === 'canvas') {
    return 'canvas';
  }
  if (ASSET_EXTENSIONS.has(ext)) {
    return 'asset';
  }
  return 'code';
}

export function getExtension(filepath: string): string {
  const parts = filepath.split('.');
  if (parts.length <= 1) return '';
  return parts.pop()?.toLowerCase() || '';
}

export function detectLanguage(filepath: string): LanguageInfo {
  const ext = getExtension(filepath);
  for (const lang of SUPPORTED_LANGUAGES) {
    if (lang.extensions.includes(ext)) {
      return lang;
    }
  }
  return {
    id: 'text',
    name: ext ? ext.toUpperCase() : 'Plain Text',
    extensions: [ext],
    prismGrammar: 'clike',
  };
}
