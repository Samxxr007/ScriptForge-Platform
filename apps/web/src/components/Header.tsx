import React, { useState } from 'react';
import { useProjectStore } from '../stores/projectStore.ts';
import { useAuthStore } from '../stores/authStore.ts';
import {
  Sparkles,
  Share2,
  Download,
  Bell,
  CheckCircle2,
  Clock,
  Command,
  Maximize2,
  Minimize2,
  LogOut,
  User,
  Film,
  Camera,
  Layers,
  MessageSquare,
} from 'lucide-react';

interface HeaderProps {
  onOpenShare: () => void;
  onOpenExport: () => void;
  onOpenCommandPalette: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenShare, onOpenExport, onOpenCommandPalette }) => {
  const {
    project,
    saveStatus,
    onlineUsers,
    isFocusMode,
    toggleFocusMode,
    toggleRightPanelTab,
    rightPanelTab,
    activeView,
    setActiveView,
  } = useProjectStore();

  const { user, logout } = useAuthStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-14 border-b border-border bg-[#0d0f17] px-4 flex items-center justify-between select-none z-30">
      {/* Left: Project Title & Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
            SF
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">{project?.name || 'ScriptForge Master'}</h1>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>{project?.genre || 'Screenplay'}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                {saveStatus === 'saved' && <span className="text-emerald-400">✓ Saved</span>}
                {saveStatus === 'saving' && <span className="text-amber-400 animate-pulse">Saving...</span>}
                {saveStatus === 'offline' && <span className="text-rose-400">Offline</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center: View Switcher (Editor, 3D Previs, Storyboard, Shots) */}
      {!isFocusMode && (
        <div className="hidden md:flex items-center gap-1 bg-[#090a0f] p-1 rounded-lg border border-border/80 text-xs">
          <button
            onClick={() => setActiveView('editor')}
            className={`px-3 py-1 rounded-md transition font-medium ${
              activeView === 'editor'
                ? 'bg-zinc-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Screenplay
          </button>
          <button
            onClick={() => setActiveView('previs')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md transition font-medium ${
              activeView === 'previs'
                ? 'bg-zinc-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            3D Previs
          </button>
          <button
            onClick={() => setActiveView('storyboard')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md transition font-medium ${
              activeView === 'storyboard'
                ? 'bg-zinc-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            Storyboard
          </button>
          <button
            onClick={() => setActiveView('shots')}
            className={`px-3 py-1 rounded-md transition font-medium ${
              activeView === 'shots'
                ? 'bg-zinc-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Shot List
          </button>
        </div>
      )}

      {/* Right Tools: Collaborators, Share, Export, AI, User */}
      <div className="flex items-center gap-2.5">
        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-[#12141c] hover:bg-zinc-800 border border-border rounded-lg text-xs text-slate-400 hover:text-slate-200 transition"
          title="Command Palette (Ctrl+K)"
        >
          <Command className="w-3.5 h-3.5" />
          <span className="font-mono text-[10px]">Ctrl+K</span>
        </button>

        {/* Live Collaborator Presence Avatars */}
        <div className="flex items-center -space-x-1.5 overflow-hidden px-1">
          {onlineUsers.map((u, i) => (
            <img
              key={u.socketId || i}
              src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`}
              alt={u.name}
              title={`${u.name} (${u.role}) - Editing live`}
              className="w-7 h-7 rounded-full border-2 border-[#0d0f17] ring-1 ring-cyan-500/50 object-cover"
            />
          ))}
        </div>

        {/* Share Button */}
        <button
          onClick={onOpenShare}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#12141c] hover:bg-zinc-800 border border-border rounded-lg text-xs font-semibold text-slate-200 hover:text-white transition"
        >
          <Share2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Share</span>
        </button>

        {/* Export Button */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#12141c] hover:bg-zinc-800 border border-border rounded-lg text-xs font-semibold text-slate-200 hover:text-white transition"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Export</span>
        </button>

        {/* AI Assistant Toggle */}
        <button
          onClick={() => toggleRightPanelTab('ai')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
            rightPanelTab === 'ai'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
              : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border-cyan-500/20'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI</span>
        </button>

        {/* Focus Mode */}
        <button
          onClick={toggleFocusMode}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          title={isFocusMode ? 'Exit Focus Mode' : 'Focus Mode'}
        >
          {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 ring-cyan-500/30 transition"
          >
            <img
              src={
                user?.avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'U')}`
              }
              alt={user?.name}
              className="w-7 h-7 rounded-full object-cover border border-border"
            />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#12141c] border border-border rounded-xl shadow-2xl p-1.5 text-xs text-slate-200 z-50 animate-in fade-in">
              <div className="p-2 border-b border-border/60">
                <div className="font-bold text-white">{user?.name}</div>
                <div className="text-[10px] text-slate-400">{user?.email}</div>
              </div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 p-2 rounded hover:bg-rose-500/10 text-rose-400 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
