import { DocumentTab } from '../types';

const STORAGE_KEY_TABS = 'synapse_draft_tabs_v1';
const STORAGE_KEY_ACTIVE = 'synapse_active_tab_id_v1';

export const recoveryService = {
  saveSession(tabs: DocumentTab[], activeTabId: string | null): void {
    try {
      const data = tabs.map(t => ({
        id: t.id,
        path: t.path,
        title: t.title,
        content: t.content,
        savedContent: t.savedContent,
        isDirty: t.isDirty,
        viewMode: t.viewMode,
        fileKind: t.fileKind,
        cursorLine: t.cursorLine,
      }));
      localStorage.setItem(STORAGE_KEY_TABS, JSON.stringify(data));
      if (activeTabId) {
        localStorage.setItem(STORAGE_KEY_ACTIVE, activeTabId);
      }
    } catch (e) {
      console.warn('Failed to save session recovery:', e);
    }
  },

  restoreSession(): { tabs: DocumentTab[]; activeTabId: string | null } | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TABS);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) return null;

      const activeTabId = localStorage.getItem(STORAGE_KEY_ACTIVE) || parsed[0]?.id || null;
      return { tabs: parsed, activeTabId };
    } catch {
      return null;
    }
  },

  clearSession(): void {
    localStorage.removeItem(STORAGE_KEY_TABS);
    localStorage.removeItem(STORAGE_KEY_ACTIVE);
  },
};
