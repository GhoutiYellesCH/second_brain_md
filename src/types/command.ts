export interface CommandItem {
  id: string;
  title: string;
  description?: string;
  shortcut?: string;
  category: 'General' | 'Navigation' | 'Editor' | 'View' | 'Vault' | 'Export';
  icon?: string;
  action: () => void;
}
