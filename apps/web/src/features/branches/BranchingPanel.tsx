import React, { useState } from 'react';
import { useProjectStore } from '../../stores/projectStore.ts';
import { api } from '../../lib/api.ts';
import { GitFork, GitMerge, Plus, Trash2, X, Check, ArrowRight } from 'lucide-react';

interface BranchingPanelProps {
  onContentChange?: (content: string) => void;
}

export const BranchingPanel: React.FC<BranchingPanelProps> = ({ onContentChange }) => {
  const { document, setDocument, activeBranchId, setActiveBranchId, setRightPanelTab } = useProjectStore();
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchDesc, setNewBranchDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const branches = document?.branches || [];

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim() || !document) return;

    try {
      const res = await api.documents.createBranch(document.id, newBranchName, newBranchDesc);
      const updated = [...branches, res.branch];
      setDocument({ ...document, branches: updated });
      setNewBranchName('');
      setNewBranchDesc('');
      setIsCreating(false);
    } catch (err: any) {
      alert('Failed to create branch: ' + err.message);
    }
  };

  const handleMerge = async (branchId: string) => {
    if (!confirm('Merge this branch into the master screenplay? A new version checkpoint will be created.')) return;
    try {
      const res = await api.documents.mergeBranch(branchId, document.id);
      setDocument({ ...document, content: res.document.content, currentVersion: res.document.currentVersion });
      if (onContentChange) onContentChange(res.document.content);
      setActiveBranchId(null);
      alert('Branch merged successfully into main story!');
    } catch (err: any) {
      alert('Failed to merge branch: ' + err.message);
    }
  };

  const handleDelete = async (branchId: string) => {
    if (!confirm('Delete this story branch?')) return;
    try {
      await api.documents.deleteBranch(branchId);
      const updated = branches.filter((b: any) => b.id !== branchId);
      setDocument({ ...document, branches: updated });
      if (activeBranchId === branchId) setActiveBranchId(null);
    } catch (err: any) {
      alert('Failed to delete branch: ' + err.message);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#12141c] text-slate-100 border-l border-border select-text">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/80 bg-[#0e1017]">
        <div className="flex items-center gap-2">
          <GitFork className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-white">Story Branches</h3>
        </div>
        <button
          onClick={() => setRightPanelTab(null)}
          className="p-1 text-slate-400 hover:text-white rounded hover:bg-zinc-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Visual Branch Tree Visualization */}
      <div className="p-4 bg-[#090a0f] border-b border-border/60">
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-3">
          Visual Story Tree
        </span>
        <div className="flex flex-col gap-2 font-mono text-xs">
          {/* Main Root */}
          <div
            onClick={() => setActiveBranchId(null)}
            className={`flex items-center gap-2 p-2 rounded cursor-pointer transition ${
              activeBranchId === null ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-300 hover:bg-zinc-800'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>MAIN STORYLINE (Master)</span>
          </div>

          {/* Branches */}
          {branches.map((b: any) => (
            <div
              key={b.id}
              onClick={() => setActiveBranchId(b.id)}
              className={`flex items-center gap-2 p-2 pl-6 rounded cursor-pointer transition relative ${
                activeBranchId === b.id
                  ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40'
                  : 'text-slate-300 hover:bg-zinc-800'
              }`}
            >
              <div className="absolute left-3 top-0 bottom-1/2 w-2 border-b border-l border-slate-600 rounded-bl" />
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span className="truncate">{b.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* New Branch Trigger */}
      <div className="p-3 border-b border-border/60 bg-[#0f1118]">
        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded text-xs font-medium transition"
          >
            <Plus className="w-3.5 h-3.5" /> Create Alternate Story Branch
          </button>
        ) : (
          <form onSubmit={handleCreateBranch} className="space-y-2">
            <input
              type="text"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              placeholder="Branch name (e.g. Hero Escapes)"
              className="w-full px-2.5 py-1.5 bg-[#090a0f] border border-border rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              autoFocus
            />
            <textarea
              value={newBranchDesc}
              onChange={(e) => setNewBranchDesc(e.target.value)}
              placeholder="Branch premise & description..."
              rows={2}
              className="w-full px-2.5 py-1.5 bg-[#090a0f] border border-border rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-medium"
              >
                Create Branch
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Branch List Details */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {branches.map((b: any) => (
          <div key={b.id} className="p-3 rounded-lg bg-[#181b26] border border-border space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-purple-300">{b.name}</h4>
              <button
                onClick={() => handleDelete(b.id)}
                className="p-1 text-slate-500 hover:text-rose-400 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {b.description && <p className="text-[11px] text-slate-400 leading-tight">{b.description}</p>}

            <div className="flex gap-2 pt-2 border-t border-border/40">
              <button
                onClick={() => handleMerge(b.id)}
                className="flex-1 flex items-center justify-center gap-1 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded text-xs font-medium transition"
              >
                <GitMerge className="w-3 h-3" /> Merge into Main
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
