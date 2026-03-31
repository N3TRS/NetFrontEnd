import { create } from "zustand";

export type PanelType = "files" | "search" | "git" | "ai";

interface EditorState {
  activePanel: PanelType | null;
  isAIDrawerOpen: boolean;

  openFiles: string[];
  activeFile: string | null;

  setActivePanel: (panel: PanelType | null) => void;
  toggleAIDrawer: () => void;
  openFile: (path: string) => void;
  closeFile: (path: string) => void;
  setActiveFile: (path: string | null) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  activePanel: "files",
  isAIDrawerOpen: false,
  openFiles: [],
  activeFile: null,

  setActivePanel: (panel) => {
    if (panel === "ai") {
      set({ isAIDrawerOpen: true, activePanel: null });
    } else {
      set({ activePanel: panel, isAIDrawerOpen: false });
    }
  },

  toggleAIDrawer: () => {
    set((state) => ({ isAIDrawerOpen: !state.isAIDrawerOpen }));
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
}));
