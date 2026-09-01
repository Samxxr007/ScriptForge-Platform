import React, { useState } from 'react';
import { useProjectStore } from '../../stores/projectStore.ts';
import { api } from '../../lib/api.ts';
import { GitBranch, Check, X, Plus, Clock, UserCheck } from 'lucide-react';

interface SuggestionsPanelProps {
  onContentChange?: (content: string) => void;
}

export const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({ onContentChange }) => {
  const { document, setDocument, setRightPanelTab } = useProjectStore();
  const [filter, setFilter] = useState<'PENDING' | 'ACCEPTED' | 'REJECTED'>('PENDING');

  const suggestions = document?.suggestions || [];
  const filtered = suggestions.filter((s: any) => s.status === filter);

  const handleAccept = async (suggestionId: string) => {
    try {
      const res = await api.documents.acceptSuggestion(suggestionId);
      const updated = suggestions.map((s: any) => (s.id === suggestionId ? res.suggestion : s));
      setDocument({ ...document, content: res.content, suggestions: updated });
      if (onContentChange) onContentChange(res.content);
    } catch (err: any) {
      alert('Failed to accept suggestion: ' + err.message);
    }
  };

  const handleReject = async (suggestionId: string) => {
    try {
      const res = await api.documents.rejectSuggestion(suggestionId);
      const updated = suggestions.map((s: any) => (s.id === suggestionId ? res.suggestion : s));
      setDocument({ ...document, suggestions: updated });
    } catch (err: any) {
      alert('Failed to reject suggestion: ' + err.message);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#12141c] text-slate-100 border-l border-border select-text">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/80 bg-[#0e1017]">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Track Changes</h3>
        </div>
        <button
          onClick={() => setRightPanelTab(null)}
          className="p-1 text-slate-400 hover:text-white rounded hover:bg-zinc-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 px-4 py-2 bg-[#090a0f] border-b border-border/60 text-xs">
        {(['PENDING', 'ACCEPTED', 'REJECTED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2.5 py-1 rounded transition ${
              filter === f ? 'bg-emerald-500/20 text-emerald-300 font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            {f === 'PENDING' ? `Pending (${suggestions.filter((s: any) => s.status === 'PENDING').length})` : f}
          </button>
        ))}
      </div>

      {/* Suggestions List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            <GitBranch className="w-6 h-6 mx-auto mb-2 opacity-30" />
            No {filter.toLowerCase()} editorial suggestions.
          </div>
        ) : (
          filtered.map((sug: any) => (
            <div key={sug.id} className="p-3.5 rounded-lg bg-[#181b26] border border-border space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold text-slate-200">{sug.author?.name || 'Story Editor'}</span>
                <span>{new Date(sug.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              {/* Visual Diff Display */}
              <div className="space-y-1.5 text-xs font-screenplay">
                <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 line-through">
                  {sug.originalText}
                </div>
                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                  {sug.suggestedText}
                </div>
              </div>

              {sug.reason && (
                <p className="text-[11px] text-slate-400 italic">
                  <strong>Rationale:</strong> {sug.reason}
                </p>
              )}

              {/* Action Buttons for Pending Suggestions */}
              {sug.status === 'PENDING' && (
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/40">
                  <button
                    onClick={() => handleReject(sug.id)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-rose-400 hover:bg-zinc-800 rounded transition"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                  <button
                    onClick={() => handleAccept(sug.id)}
                    className="flex items-center gap-1 px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium transition"
                  >
                    <Check className="w-3.5 h-3.5" /> Accept Suggestion
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
