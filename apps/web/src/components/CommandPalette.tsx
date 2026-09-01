import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../stores/projectStore.ts';
import {
  Search,
  Sparkles,
  Clapperboard,
  Film,
  Camera,
  History,
  GitFork,
  MessageSquare,
  Users,
  Download,
  Maximize2,
  X,
  FileText,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStoryStudio?: () => void;
  onOpenExport?: () => void;
  onOpenShare?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenStoryStudio,
  onOpenExport,
  onOpenShare,
}) => {
  const [query, setQuery] = useState('');
  const {
    scenes,
    setActiveSceneId,
    setActiveView,
    toggleRightPanelTab,
    toggleFocusMode,
  } = useProjectStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    {
      id: 'ai-studio',
      name: 'Launch AI Story Studio',
      category: 'AI & Generation',
      icon: Sparkles,
      action: () => onOpenStoryStudio && onOpenStoryStudio(),
    },
    {
      id: 'previs',
      name: 'Open 3D Camera Previsualization',
      category: 'Views',
      icon: Camera,
      action: () => setActiveView('previs'),
    },
    {
      id: 'storyboard',
      name: 'Open Storyboard Grid',
      category: 'Views',
      icon: Film,
      action: () => setActiveView('storyboard'),
    },
    {
      id: 'shots',
      name: 'Open Shot List Table',
      category: 'Views',
      icon: Clapperboard,
      action: () => setActiveView('shots'),
    },
    {
      id: 'versions',
      name: 'Open Version History & Diffs',
      category: 'Version Control',
      icon: History,
      action: () => toggleRightPanelTab('versions'),
    },
    {
      id: 'branches',
      name: 'Open Story Branches Tree',
      category: 'Version Control',
      icon: GitFork,
      action: () => toggleRightPanelTab('branches'),
    },
    {
      id: 'comments',
      name: 'Open Comments & Review',
      category: 'Collaboration',
      icon: MessageSquare,
      action: () => toggleRightPanelTab('comments'),
    },
    {
      id: 'share',
      name: 'Invite Collaborators / Manage Roles',
      category: 'Collaboration',
      icon: Users,
      action: () => onOpenShare && onOpenShare(),
    },
    {
      id: 'export',
      name: 'Export Screenplay (PDF / FDX / DOCX / Fountain)',
      category: 'Production',
      icon: Download,
      action: () => onOpenExport && onOpenExport(),
    },
    {
      id: 'focus',
      name: 'Toggle Distraction-Free Focus Mode',
      category: 'Editor',
      icon: Maximize2,
      action: () => toggleFocusMode(),
    },
  ];

  const filteredCommands = commands.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) || c.category.toLowerCase().includes(query.toLowerCase())
  );

  const filteredScenes = scenes.filter((s) => s.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl bg-[#12141c] border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-border bg-[#0e1017]">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to scene (INT. / EXT.)..."
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            autoFocus
          />
          <kbd className="px-2 py-0.5 bg-zinc-800 border border-border rounded text-[10px] text-slate-400 font-mono">
            ESC
          </kbd>
        </div>

        {/* Command & Scene Results */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3 text-xs">
          {/* Scene Matches */}
          {filteredScenes.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Scenes in Screenplay
              </div>
              {filteredScenes.map((sc) => (
                <div
                  key={sc.id}
                  onClick={() => {
                    setActiveSceneId(sc.id);
                    setActiveView('editor');
                    onClose();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-zinc-800 cursor-pointer transition text-slate-200"
                >
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono">{sc.title}</span>
                </div>
              ))}
            </div>
          )}

          {/* Action Commands */}
          <div>
            <div className="px-3 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Commands & Tools
            </div>
            {filteredCommands.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-800 cursor-pointer transition text-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span>{cmd.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{cmd.category}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
