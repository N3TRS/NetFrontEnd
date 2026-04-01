import { create } from "zustand";

export type PanelType = "files" | "search" | "git" | "ai";
export type LeftPanelType = "files" | "search" | "git";

interface EditorState {
  activePanel: LeftPanelType | null;
  isAIDrawerOpen: boolean;
  isTerminalOpen: boolean;

  openFiles: string[];
  activeFile: string | null;
  isSynced: boolean;

  sessionId: string | null;
  inviteCode: string | null;

  setActivePanel: (panel: LeftPanelType | null) => void;
  toggleAIDrawer: () => void;
  toggleTerminal: () => void;
  openFile: (path: string) => void;
  closeFile: (path: string) => void;
  setActiveFile: (path: string | null) => void;
  setSynced: (v: boolean) => void;
  setSessionId: (id: string | null) => void;
  setInviteCode: (code: string | null) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  activePanel: "files",
  isAIDrawerOpen: false,
  isTerminalOpen: false,
  openFiles: [],
  activeFile: null,
  isSynced: false,
  sessionId: null,
  inviteCode: null,

  setActivePanel: (panel) => {
    set({ activePanel: panel });
  },

  toggleAIDrawer: () => {
    set((state) => ({ isAIDrawerOpen: !state.isAIDrawerOpen }));
  },

  toggleTerminal: () => {
    set((state) => ({ isTerminalOpen: !state.isTerminalOpen }));
  },

  openFile: (path) => {
    set((state) => ({
      openFiles: state.openFiles.includes(path)
        ? state.openFiles
        : [...state.openFiles, path],
      activeFile: path,
    }));
  },

  closeFile: (path) => {
    set((state) => {
      const newOpenFiles = state.openFiles.filter((f) => f !== path);
      return {
        openFiles: newOpenFiles,
        activeFile:
          state.activeFile === path
            ? newOpenFiles[newOpenFiles.length - 1] || null
            : state.activeFile,
      };
    });
  },

  setActiveFile: (path) => {
    set({ activeFile: path });
  },

  setSynced: (v) => set({ isSynced: v }),
  setSessionId: (id) => set({ sessionId: id }),
  setInviteCode: (code) => set({ inviteCode: code }),
}));
