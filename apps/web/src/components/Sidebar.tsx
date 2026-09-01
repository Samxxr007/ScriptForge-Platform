import React, { useState } from 'react';
import { useProjectStore } from '../stores/projectStore.ts';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.ts';
import {
  LayoutDashboard,
  FileText,
  Plus,
  Users,
  Camera,
  Film,
  Clapperboard,
  History,
  GitFork,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Trash2,
  FolderKanban,
} from 'lucide-react';

interface SidebarProps {
  onOpenStoryStudio: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenStoryStudio }) => {
  const navigate = useNavigate();
  const {
    project,
    document,
    scenes,
    activeSceneId,
    setActiveSceneId,
    activeView,
    setActiveView,
    toggleRightPanelTab,
    rightPanelTab,
    isFocusMode,
  } = useProjectStore();

  const [isScenesOpen, setIsScenesOpen] = useState(true);
  const [isAddingScene, setIsAddingScene] = useState(false);
  const [newSceneTitle, setNewSceneTitle] = useState('');

  if (isFocusMode) return null;

  const handleCreateScene = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSceneTitle.trim() || !document) return;

    try {
      const res = await api.documents.createScene(document.id, {
        title: newSceneTitle.toUpperCase(),
      });
      // Append new scene
      const updated = [...scenes, res.scene];
      useProjectStore.getState().setScenes(updated);
      setActiveSceneId(res.scene.id);
      setNewSceneTitle('');
      setIsAddingScene(false);
    } catch (err: any) {
      alert('Failed to add scene: ' + err.message);
    }
  };

  return (
    <aside className="w-64 border-r border-border bg-[#0d0f17] flex flex-col justify-between text-xs select-none z-20">
      {/* Upper Navigation */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Dashboard & Studio Actions */}
        <div className="space-y-1">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-zinc-800 transition font-medium"
          >
            <LayoutDashboard className="w-4 h-4 text-cyan-400" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={onOpenStoryStudio}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 text-cyan-300 border border-cyan-500/20 transition font-semibold"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI Story Studio</span>
          </button>
        </div>

        {/* View Switchers */}
        <div className="space-y-1 pt-2 border-t border-border/60">
          <div className="px-3 py-1 text-[10px] uppercase tracking-wider font-semibold text-slate-500">
            Workspaces
          </div>

          <button
            onClick={() => setActiveView('editor')}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition ${
              activeView === 'editor' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Screenplay Editor</span>
          </button>

          <button
            onClick={() => setActiveView('previs')}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition ${
              activeView === 'previs' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>3D Previs & Camera</span>
          </button>

          <button
            onClick={() => setActiveView('storyboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition ${
              activeView === 'storyboard' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Storyboard Frames</span>
          </button>

          <button
            onClick={() => setActiveView('shots')}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition ${
              activeView === 'shots' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clapperboard className="w-4 h-4" />
            <span>Shot List Table</span>
          </button>
        </div>

        {/* Scene Navigator Accordion */}
        <div className="space-y-1 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between px-3 py-1">
            <button
              onClick={() => setIsScenesOpen(!isScenesOpen)}
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-slate-400 hover:text-white"
            >
              {isScenesOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <span>Scenes ({scenes.length})</span>
            </button>
            <button
              onClick={() => setIsAddingScene(true)}
              className="p-0.5 text-cyan-400 hover:bg-zinc-800 rounded"
              title="Add Scene"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {isAddingScene && (
            <form onSubmit={handleCreateScene} className="p-2 space-y-1.5 bg-[#12141c] rounded-lg border border-border">
              <input
                type="text"
                value={newSceneTitle}
                onChange={(e) => setNewSceneTitle(e.target.value)}
                placeholder="INT. CONTROL ROOM - NIGHT"
                className="w-full p-1.5 bg-[#090a0f] border border-border rounded text-[11px] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                autoFocus
              />
              <div className="flex justify-end gap-1">
                <button
                  type="button"
                  onClick={() => setIsAddingScene(false)}
                  className="px-2 py-0.5 text-[10px] text-slate-400"
                >
                  Cancel
                </button>
                <button type="submit" className="px-2 py-0.5 bg-cyan-600 text-white rounded text-[10px] font-medium">
                  Add
                </button>
              </div>
            </form>
          )}

          {isScenesOpen && (
            <div className="space-y-0.5 max-h-60 overflow-y-auto pr-1">
              {scenes.map((scene, idx) => (
                <button
                  key={scene.id}
                  onClick={() => {
                    setActiveSceneId(scene.id);
                    setActiveView('editor');
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition font-mono text-[11px] ${
                    activeSceneId === scene.id
                      ? 'bg-zinc-800 text-cyan-300 font-bold border-l-2 border-cyan-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-zinc-900'
                  }`}
                >
                  <span className="truncate">
                    {idx + 1}. {scene.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Story Tools Drawer Links */}
        <div className="space-y-1 pt-2 border-t border-border/60">
          <div className="px-3 py-1 text-[10px] uppercase tracking-wider font-semibold text-slate-500">
            Project Tools
          </div>

          <button
            onClick={() => toggleRightPanelTab('characters')}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition ${
              rightPanelTab === 'characters' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Characters ({project?.characters?.length || 0})</span>
          </button>

          <button
            onClick={() => toggleRightPanelTab('versions')}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition ${
              rightPanelTab === 'versions' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Version History (v{document?.currentVersion || 1})</span>
          </button>

          <button
            onClick={() => toggleRightPanelTab('branches')}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition ${
              rightPanelTab === 'branches' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitFork className="w-4 h-4" />
            <span>Branches ({document?.branches?.length || 0})</span>
          </button>

          <button
            onClick={() => toggleRightPanelTab('comments')}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition ${
              rightPanelTab === 'comments' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Comments & Review</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
