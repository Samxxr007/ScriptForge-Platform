import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useProjectStore } from '../stores/projectStore.ts';
import { useAuthStore } from '../stores/authStore.ts';
import { api } from '../lib/api.ts';
import { getSocket } from '../lib/socket.ts';
import {
  Bold,
  Italic,
  Underline,
  Highlighter,
  MessageSquarePlus,
  Sparkles,
  Search,
  Maximize2,
  Minimize2,
  Save,
  CheckCircle2,
  Clock,
  Clapperboard,
  RotateCcw,
  RotateCw,
  GitBranch,
} from 'lucide-react';

interface ScreenplayEditorProps {
  initialContent: string;
  documentId: string;
  onContentChange?: (content: string) => void;
  onAddComment?: (selectedText: string, startPos: number, endPos: number) => void;
  onAddSuggestion?: (originalText: string) => void;
  onAskAI?: (selectedText: string) => void;
}

export const ScreenplayEditor: React.FC<ScreenplayEditorProps> = ({
  initialContent,
  documentId,
  onContentChange,
  onAddComment,
  onAddSuggestion,
  onAskAI,
}) => {
  const [content, setContent] = useState(initialContent);
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const [bubbleMenuPos, setBubbleMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [stats, setStats] = useState({ words: 0, characters: 0, scenes: 0, estimatedPages: 1 });
  const [activeLineType, setActiveLineType] = useState<string>('Action');

  const { saveStatus, setSaveStatus, isFocusMode, toggleFocusMode, toggleRightPanelTab, onlineUsers } = useProjectStore();
  const { user } = useAuthStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync initial content
  useEffect(() => {
    setContent(initialContent);
    calculateStats(initialContent);
  }, [initialContent]);

  // Real-time socket sync
  useEffect(() => {
    const socket = getSocket();
    socket.emit('document:join', { documentId, role: user?.roleTitle });

    const handleDocUpdate = (data: { userId: string; content?: string }) => {
      if (data.userId !== user?.id && data.content !== undefined) {
        setContent(data.content);
        calculateStats(data.content);
      }
    };

    socket.on('document:update', handleDocUpdate);

    return () => {
      socket.off('document:update', handleDocUpdate);
    };
  }, [documentId, user]);

  // Calculate live statistics
  const calculateStats = (text: string) => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const characters = text.length;
    const sceneMatches = text.match(/^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)/gim);
    const scenes = sceneMatches ? sceneMatches.length : 0;
    // Industry formula: ~200 words or ~55 lines per page
    const lines = text.split('\n').length;
    const estimatedPages = Math.max(1, Math.ceil(lines / 50));

    setStats({ words, characters, scenes, estimatedPages });
  };

  // Debounced Autosave (800ms)
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setContent(newText);
    calculateStats(newText);
    setSaveStatus('saving');

    if (onContentChange) onContentChange(newText);

    // Broadcast delta via socket
    const socket = getSocket();
    socket.emit('document:update', { documentId, content: newText });

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await api.documents.updateContent(documentId, newText, false);
        setSaveStatus('saved');
      } catch (err) {
        console.error('Autosave failed:', err);
        setSaveStatus('offline');
      }
    }, 800);
  };

  // Screenplay Tab Cycling Shortcut Handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Handle Tab for cycling screenplay element types
    if (e.key === 'Tab') {
      e.preventDefault();
      const pos = textarea.selectionStart;
      const lines = content.slice(0, pos).split('\n');
      const currentLineIndex = lines.length - 1;
      const allLines = content.split('\n');
      const currentLine = allLines[currentLineIndex];

      // Screenplay block cycle: Scene Heading -> Action -> Character -> Dialogue -> Parenthetical -> Transition
      let newLine = currentLine;
      const isShift = e.shiftKey;

      if (/^(INT\.|EXT\.|INT\/EXT\.)/i.test(currentLine)) {
        newLine = isShift ? `CUT TO:` : currentLine.replace(/^(INT\.|EXT\.|INT\/EXT\.)\s*/i, '');
      } else if (currentLine === currentLine.toUpperCase() && currentLine.length > 0 && !currentLine.startsWith('(')) {
        newLine = isShift ? `INT. ${currentLine}` : `\n    ${currentLine.toLowerCase()}`;
      } else {
        newLine = `INT. ${currentLine.toUpperCase()}`;
      }

      allLines[currentLineIndex] = newLine;
      const updatedContent = allLines.join('\n');
      setContent(updatedContent);
      calculateStats(updatedContent);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = pos + (newLine.length - currentLine.length);
      }, 0);
    }
  };

  // Handle text selection for floating menu
  const handleSelect = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end).trim();

    if (selected.length > 0) {
      setSelectedText(selected);
      setSelectionRange({ start, end });

      // Approximate coordinates
      const rect = textarea.getBoundingClientRect();
      setBubbleMenuPos({
        top: Math.max(10, rect.top - 45),
        left: Math.min(window.innerWidth - 300, rect.left + rect.width / 2 - 120),
      });
    } else {
      setSelectedText('');
      setBubbleMenuPos(null);
    }
  };

  return (
    <div className="relative flex flex-col h-full bg-[#090a0f] text-slate-100 select-text overflow-hidden">
      {/* Top Editor Toolbar */}
      {!isFocusMode && (
        <div className="flex items-center justify-between px-4 py-2 bg-[#0d0f17] border-b border-border/70 z-10">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                const textarea = textareaRef.current;
                if (!textarea) return;
                const pos = textarea.selectionStart;
                const text = content.slice(0, pos) + '\nINT. ' + content.slice(pos);
                setContent(text);
                calculateStats(text);
              }}
              className="px-2.5 py-1 text-xs font-semibold bg-zinc-800/80 hover:bg-zinc-700 text-cyan-400 rounded transition"
              title="Insert Scene Heading (Tab cycles)"
            >
              + Scene Heading
            </button>
            <button
              onClick={() => {
                const textarea = textareaRef.current;
                if (!textarea) return;
                const pos = textarea.selectionStart;
                const text = content.slice(0, pos) + '\n\nCHARACTER\n(parenthetical)\nDialogue line.' + content.slice(pos);
                setContent(text);
                calculateStats(text);
              }}
              className="px-2.5 py-1 text-xs font-medium bg-zinc-800/50 hover:bg-zinc-700 text-slate-300 rounded transition"
            >
              + Dialogue Block
            </button>
            <button
              onClick={() => {
                const textarea = textareaRef.current;
                if (!textarea) return;
                const pos = textarea.selectionStart;
                const text = content.slice(0, pos) + '\n\nCUT TO:\n' + content.slice(pos);
                setContent(text);
                calculateStats(text);
              }}
              className="px-2.5 py-1 text-xs font-medium bg-zinc-800/50 hover:bg-zinc-700 text-amber-400 rounded transition"
            >
              + Transition
            </button>
          </div>

          {/* Action shortcuts */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleRightPanelTab('ai')}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 rounded border border-cyan-500/30 transition shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Assistant
            </button>

            <button
              onClick={() => toggleRightPanelTab('comments')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-zinc-800/60 hover:bg-zinc-700 rounded transition"
              title="Open Comments"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={toggleFocusMode}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-zinc-800 rounded transition"
              title={isFocusMode ? 'Exit Focus Mode (Esc)' : 'Enter Distraction-Free Focus Mode'}
            >
              {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Floating Selection Bubble Menu */}
      {bubbleMenuPos && selectedText && (
        <div
          style={{ top: `${bubbleMenuPos.top}px`, left: `${bubbleMenuPos.left}px` }}
          className="fixed z-50 flex items-center gap-1 bg-[#12141c] border border-border rounded-lg shadow-2xl p-1 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
        >
          <button
            onClick={() => {
              if (onAddComment && selectionRange) {
                onAddComment(selectedText, selectionRange.start, selectionRange.end);
                setBubbleMenuPos(null);
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-200 hover:text-cyan-400 hover:bg-zinc-800 rounded transition"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            Comment
          </button>
          <button
            onClick={() => {
              if (onAddSuggestion) {
                onAddSuggestion(selectedText);
                setBubbleMenuPos(null);
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-emerald-400 hover:bg-emerald-500/10 rounded transition"
          >
            <GitBranch className="w-3.5 h-3.5" />
            Suggest
          </button>
          <div className="w-[1px] h-4 bg-border mx-0.5" />
          <button
            onClick={() => {
              if (onAskAI) {
                onAskAI(selectedText);
                setBubbleMenuPos(null);
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 rounded transition font-medium"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Rewrite
          </button>
        </div>
      )}

      {/* Main Page-Like Screenplay Canvas */}
      <div className="flex-1 overflow-y-auto px-4 py-8 flex justify-center bg-[#090a0f]">
        <div className="w-full max-w-[850px] min-h-[950px] bg-[#0e1017] border border-border/80 rounded-sm shadow-2xl p-12 sm:p-16 text-slate-100 flex flex-col">
          {/* Header indicator */}
          <div className="flex justify-between items-center text-[11px] text-slate-500 border-b border-border/40 pb-3 mb-6 select-none font-screenplay">
            <span>DRAFT VIEW • WGA FORMAT</span>
            <span>TAB = CYCLE ELEMENTS</span>
          </div>

          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onSelect={handleSelect}
            placeholder="INT. ABANDONED STATION - NIGHT&#10;&#10;Action description here...&#10;&#10;CHARACTER&#10;Dialogue line here."
            className="w-full flex-1 bg-transparent border-none outline-none resize-none screenplay-canvas text-slate-100 placeholder-slate-600 leading-relaxed tracking-wide min-h-[700px]"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Bottom Professional Screenplay Statistics Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0b0c13] border-t border-border/70 text-xs text-slate-400 select-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {saveStatus === 'saved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            {saveStatus === 'saving' && <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
            {saveStatus === 'offline' && <span className="w-2 h-2 rounded-full bg-rose-500" />}
            <span className="capitalize text-[11px]">
              {saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'saving' ? 'Saving...' : 'Saved locally'}
            </span>
          </div>

          <span className="text-border">|</span>

          <span>{stats.words.toLocaleString()} Words</span>
          <span>{stats.scenes} Scenes</span>
          <span>~{stats.estimatedPages} {stats.estimatedPages === 1 ? 'Page' : 'Pages'}</span>
        </div>

        <div className="flex items-center gap-3">
          {onlineUsers.length > 1 && (
            <div className="flex items-center gap-1.5 text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              {onlineUsers.length} editing live
            </div>
          )}
          <span className="text-[11px] text-slate-500 font-mono">Courier Prime 12pt</span>
        </div>
      </div>
    </div>
  );
};
