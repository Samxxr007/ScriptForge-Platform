import React, { useState } from 'react';
import { useProjectStore } from '../../stores/projectStore.ts';
import { api } from '../../lib/api.ts';
import { History, RotateCcw, Eye, GitCompare, Plus, X, CheckCircle2, Clock } from 'lucide-react';

interface VersionHistoryPanelProps {
  onContentChange?: (content: string) => void;
}

export const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({ onContentChange }) => {
  const { document, setDocument, setRightPanelTab } = useProjectStore();
  const [selectedVersion, setSelectedVersion] = useState<any>(null);
  const [diffComparison, setDiffComparison] = useState<{ v1: any; v2: any } | null>(null);
  const [isCheckpointing, setIsCheckpointing] = useState(false);
  const [checkpointSummary, setCheckpointSummary] = useState('');

  const versions = document?.versions || [];

  const handleCreateCheckpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!document) return;
    try {
      const res = await api.documents.createVersion(document.id, checkpointSummary || undefined);
      const updatedVersions = [res.version, ...versions];
      setDocument({
        ...document,
        currentVersion: res.version.versionNumber,
        versions: updatedVersions,
      });
      setCheckpointSummary('');
      setIsCheckpointing(false);
    } catch (err: any) {
      alert('Failed to create version: ' + err.message);
    }
  };

  const handleRestore = async (versionId: string) => {
    if (!confirm('Safe Restore: This will create a NEW version restoring previous content without erasing history. Proceed?')) {
      return;
    }
    try {
      const res = await api.documents.restoreVersion(versionId);
      const updatedVersions = [res.restoredVersion, ...versions];
      setDocument({
        ...document,
        content: res.content,
        currentVersion: res.currentVersion,
        versions: updatedVersions,
      });
      if (onContentChange) onContentChange(res.content);
      setSelectedVersion(null);
      setDiffComparison(null);
    } catch (err: any) {
      alert('Failed to restore version: ' + err.message);
    }
  };

  const handleCompareWithCurrent = (version: any) => {
    setDiffComparison({
      v1: version,
      v2: {
        versionNumber: document.currentVersion,
        content: document.content,
      },
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#12141c] text-slate-100 border-l border-border select-text">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/80 bg-[#0e1017]">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Version History</h3>
        </div>
        <button
          onClick={() => setRightPanelTab(null)}
          className="p-1 text-slate-400 hover:text-white rounded hover:bg-zinc-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Checkpoint Trigger */}
      <div className="p-3 border-b border-border/60 bg-[#0f1118]">
        {!isCheckpointing ? (
          <button
            onClick={() => setIsCheckpointing(true)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded text-xs font-medium transition"
          >
            <Plus className="w-3.5 h-3.5" /> Save Named Snapshot
          </button>
        ) : (
          <form onSubmit={handleCreateCheckpoint} className="space-y-2">
            <input
              type="text"
              value={checkpointSummary}
              onChange={(e) => setCheckpointSummary(e.target.value)}
              placeholder="e.g. End of Act I draft..."
              className="w-full px-2.5 py-1.5 bg-[#090a0f] border border-border rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              autoFocus
            />
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setIsCheckpointing(false)}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-medium"
              >
                Save
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Version List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {versions.map((ver: any) => (
          <div
            key={ver.id}
            className={`p-3 rounded-lg border transition ${
              ver.versionNumber === document?.currentVersion
                ? 'bg-cyan-500/10 border-cyan-500/50'
                : 'bg-[#181b26] border-border hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-cyan-400">v{ver.versionNumber}</span>
                {ver.versionNumber === document?.currentVersion && (
                  <span className="px-1.5 py-0.2 rounded bg-cyan-500 text-[10px] text-slate-900 font-bold">
                    Current
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400">
                {new Date(ver.createdAt).toLocaleDateString()} •{' '}
                {new Date(ver.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <p className="text-xs text-slate-200 mb-2">{ver.changeSummary || `Version ${ver.versionNumber}`}</p>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-border/40">
              <span>By {ver.author?.name || 'Author'}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedVersion(ver)}
                  className="flex items-center gap-1 hover:text-cyan-400 transition"
                  title="Preview"
                >
                  <Eye className="w-3 h-3" /> View
                </button>
                <button
                  onClick={() => handleCompareWithCurrent(ver)}
                  className="flex items-center gap-1 hover:text-purple-400 transition"
                  title="Compare"
                >
                  <GitCompare className="w-3 h-3" /> Diff
                </button>
                {ver.versionNumber !== document?.currentVersion && (
                  <button
                    onClick={() => handleRestore(ver.id)}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition"
                    title="Safe Non-Destructive Restore"
                  >
                    <RotateCcw className="w-3 h-3" /> Restore
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Version Preview Modal */}
      {selectedVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#12141c] border border-border rounded-xl shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-sm text-cyan-400">Previewing Version {selectedVersion.versionNumber}</h3>
                <p className="text-xs text-slate-400">{selectedVersion.changeSummary}</p>
              </div>
              <button onClick={() => setSelectedVersion(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 rounded bg-[#090a0f] border border-border font-screenplay text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
              {selectedVersion.content}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => handleRestore(selectedVersion.id)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restore This Version
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visual Diff Comparison Modal */}
      {diffComparison && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-4xl bg-[#12141c] border border-border rounded-xl shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-sm text-white">
                  Comparing Version {diffComparison.v1.versionNumber} with Version {diffComparison.v2.versionNumber}
                </h3>
              </div>
              <button onClick={() => setDiffComparison(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-rose-400">Previous (v{diffComparison.v1.versionNumber})</div>
                <div className="p-3 bg-[#090a0f] border border-border rounded font-screenplay text-xs text-slate-300 whitespace-pre-wrap h-full max-h-[450px] overflow-y-auto leading-relaxed">
                  {diffComparison.v1.content}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-semibold text-emerald-400">Current (v{diffComparison.v2.versionNumber})</div>
                <div className="p-3 bg-[#090a0f] border border-border rounded font-screenplay text-xs text-slate-300 whitespace-pre-wrap h-full max-h-[450px] overflow-y-auto leading-relaxed">
                  {diffComparison.v2.content}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
