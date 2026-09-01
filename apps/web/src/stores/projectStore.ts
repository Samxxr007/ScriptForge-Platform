import { create } from 'zustand';

export type RightPanelTab =
  | 'comments'
  | 'suggestions'
  | 'ai'
  | 'versions'
  | 'branches'
  | 'characters'
  | 'shots'
  | 'previs'
  | 'outline'
  | null;

export type ActiveWorkspaceView = 'editor' | 'previs' | 'storyboard' | 'shots' | 'characters' | 'branches' | 'versions';

export interface PresenceUser {
  socketId: string;
  userId: string;
  name: string;
  avatar: string | null;
  role: string;
  sceneId?: string;
  cursor?: { x: number; y: number; lineIndex?: number };
}

interface ProjectState {
  project: any | null;
  document: any | null;
  scenes: any[];
  activeSceneId: string | null;
  activeBranchId: string | null;
  activeView: ActiveWorkspaceView;
  rightPanelTab: RightPanelTab;
  isFocusMode: boolean;
  saveStatus: 'saved' | 'saving' | 'unsaved' | 'offline';
  lastSavedTime: Date | null;
  onlineUsers: PresenceUser[];
  userRole: 'OWNER' | 'WRITER' | 'EDITOR' | 'VIEWER';

  setProject: (project: any) => void;
  setDocument: (document: any) => void;
  setScenes: (scenes: any[]) => void;
  setActiveSceneId: (sceneId: string | null) => void;
  setActiveBranchId: (branchId: string | null) => void;
  setActiveView: (view: ActiveWorkspaceView) => void;
  setRightPanelTab: (tab: RightPanelTab) => void;
  toggleRightPanelTab: (tab: RightPanelTab) => void;
  setFocusMode: (focus: boolean) => void;
  toggleFocusMode: () => void;
  setSaveStatus: (status: 'saved' | 'saving' | 'unsaved' | 'offline') => void;
  setOnlineUsers: (users: PresenceUser[]) => void;
  setUserRole: (role: 'OWNER' | 'WRITER' | 'EDITOR' | 'VIEWER') => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: null,
  document: null,
  scenes: [],
  activeSceneId: null,
  activeBranchId: null,
  activeView: 'editor',
  rightPanelTab: null,
  isFocusMode: false,
  saveStatus: 'saved',
  lastSavedTime: new Date(),
  onlineUsers: [],
  userRole: 'WRITER',

  setProject: (project) => set({ project }),
  setDocument: (document) => set({ document }),
  setScenes: (scenes) => set({ scenes }),
  setActiveSceneId: (activeSceneId) => set({ activeSceneId }),
  setActiveBranchId: (activeBranchId) => set({ activeBranchId }),
  setActiveView: (activeView) => set({ activeView }),
  setRightPanelTab: (rightPanelTab) => set({ rightPanelTab }),
  toggleRightPanelTab: (tab) => set((state) => ({ rightPanelTab: state.rightPanelTab === tab ? null : tab })),
  setFocusMode: (isFocusMode) => set({ isFocusMode }),
  toggleFocusMode: () => set((state) => ({ isFocusMode: !state.isFocusMode })),
  setSaveStatus: (saveStatus) => set({ saveStatus, lastSavedTime: saveStatus === 'saved' ? new Date() : get().lastSavedTime }),
  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
  setUserRole: (userRole) => set({ userRole }),
}));
