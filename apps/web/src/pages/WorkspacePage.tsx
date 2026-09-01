import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '../stores/projectStore.ts';
import { useAuthStore } from '../stores/authStore.ts';
import { api } from '../lib/api.ts';
import { getSocket } from '../lib/socket.ts';

// Components
import { Header } from '../components/Header.tsx';
import { Sidebar } from '../components/Sidebar.tsx';
import { ScreenplayEditor } from '../editor/ScreenplayEditor.tsx';
import { CommandPalette } from '../components/CommandPalette.tsx';
import { ShareModal } from '../components/modals/ShareModal.tsx';
import { ExportModal } from '../components/modals/ExportModal.tsx';
import { StoryStudioModal } from '../features/ai/StoryStudioModal.tsx';

// Drawers & Views
import { AIAssistantPanel } from '../features/ai/AIAssistantPanel.tsx';
import { CommentsPanel } from '../features/comments/CommentsPanel.tsx';
import { SuggestionsPanel } from '../features/suggestions/SuggestionsPanel.tsx';
import { VersionHistoryPanel } from '../features/versions/VersionHistoryPanel.tsx';
import { BranchingPanel } from '../features/branches/BranchingPanel.tsx';
import { CharacterPanel } from '../features/characters/CharacterPanel.tsx';
import { ShotListPanel } from '../features/shots/ShotListPanel.tsx';
import { StoryboardGrid } from '../features/storyboard/StoryboardGrid.tsx';
import { ScenePrevisWorkspace } from '../features/previs/ScenePrevisWorkspace.tsx';

export const WorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    project,
    setProject,
    document,
    setDocument,
    setScenes,
    activeView,
    rightPanelTab,
    setRightPanelTab,
    setOnlineUsers,
    isFocusMode,
    setUserRole,
  } = useProjectStore();

  const { user } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isStoryStudioOpen, setIsStoryStudioOpen] = useState(false);
  const [selectedEditorText, setSelectedEditorText] = useState('');

  useEffect(() => {
    if (id) loadProjectWorkspace(id);
  }, [id]);

  const loadProjectWorkspace = async (projectId: string) => {
    setIsLoading(true);
    try {
      const res = await api.projects.get(projectId);
      const proj = res.project;
      setProject(proj);

      // Determine user role
      if (proj.ownerId === user?.id) {
        setUserRole('OWNER');
      } else {
        const member = proj.members?.find((m: any) => m.userId === user?.id);
        setUserRole(member ? member.role : 'WRITER');
      }

      if (proj.documents && proj.documents.length > 0) {
        const doc = proj.documents[0];
        setDocument(doc);
        setScenes(doc.scenes || []);
      }
    } catch (err: any) {
      console.error('Failed to load project:', err);
      alert('Could not load project: ' + err.message);
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  // Socket setup for presence & updates
  useEffect(() => {
    if (!document?.id) return;
    const socket = getSocket();

    socket.emit('document:join', { documentId: document.id, role: user?.roleTitle });

    const handlePresence = (users: any[]) => {
      setOnlineUsers(users);
    };

    socket.on('presence:update', handlePresence);

    return () => {
      socket.off('presence:update', handlePresence);
    };
  }, [document?.id, user]);

  if (isLoading || !project || !document) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex items-center justify-center text-slate-400 text-xs">
        <div className="space-y-3 text-center">
          <div className="w-8 h-8 mx-auto rounded-lg bg-cyan-600 animate-pulse" />
          <div>Loading ScriptForge Studio Workspace...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#090a0f] flex flex-col overflow-hidden text-slate-100 font-sans">
      {/* Top Header Navigation */}
      <Header
        onOpenShare={() => setIsShareModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar onOpenStoryStudio={() => setIsStoryStudioOpen(true)} />

        {/* Center Canvas / Views */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-[#090a0f]">
          {activeView === 'editor' && (
            <ScreenplayEditor
              initialContent={document.content}
              documentId={document.id}
              onContentChange={(newContent) => {
                setDocument({ ...document, content: newContent });
              }}
              onAddComment={(selText, start, end) => {
                setSelectedEditorText(selText);
                setRightPanelTab('comments');
              }}
              onAddSuggestion={(originalText) => {
                setSelectedEditorText(originalText);
                setRightPanelTab('suggestions');
              }}
              onAskAI={(selText) => {
                setSelectedEditorText(selText);
                setRightPanelTab('ai');
              }}
            />
          )}

          {activeView === 'previs' && <ScenePrevisWorkspace />}
          {activeView === 'storyboard' && <StoryboardGrid />}
          {activeView === 'shots' && <ShotListPanel />}
        </main>

        {/* Contextual Right Drawer */}
        {rightPanelTab && !isFocusMode && (
          <aside className="w-96 border-l border-border bg-[#12141c] flex flex-col z-20 shadow-2xl animate-in slide-in-from-right duration-200">
            {rightPanelTab === 'ai' && (
              <AIAssistantPanel
                selectedText={selectedEditorText}
                onInsertContent={(txt) => {
                  const updated = document.content + '\n\n' + txt;
                  setDocument({ ...document, content: updated });
                  api.documents.updateContent(document.id, updated, false);
                }}
                onReplaceContent={(txt) => {
                  if (selectedEditorText && document.content.includes(selectedEditorText)) {
                    const updated = document.content.replace(selectedEditorText, txt);
                    setDocument({ ...document, content: updated });
                    api.documents.updateContent(document.id, updated, false);
                  }
                }}
              />
            )}
            {rightPanelTab === 'comments' && <CommentsPanel />}
            {rightPanelTab === 'suggestions' && (
              <SuggestionsPanel
                onContentChange={(c) => setDocument({ ...document, content: c })}
              />
            )}
            {rightPanelTab === 'versions' && (
              <VersionHistoryPanel
                onContentChange={(c) => setDocument({ ...document, content: c })}
              />
            )}
            {rightPanelTab === 'branches' && (
              <BranchingPanel
                onContentChange={(c) => setDocument({ ...document, content: c })}
              />
            )}
            {rightPanelTab === 'characters' && <CharacterPanel />}
          </aside>
        )}
      </div>

      {/* Global Modals */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenStoryStudio={() => {
          setIsCommandPaletteOpen(false);
          setIsStoryStudioOpen(true);
        }}
        onOpenExport={() => {
          setIsCommandPaletteOpen(false);
          setIsExportModalOpen(true);
        }}
        onOpenShare={() => {
          setIsCommandPaletteOpen(false);
          setIsShareModalOpen(true);
        }}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      <StoryStudioModal
        isOpen={isStoryStudioOpen}
        onClose={() => setIsStoryStudioOpen(false)}
        onStoryCreated={(newProj) => navigate(`/workspace/${newProj.id}`)}
      />
    </div>
  );
};
