import React, { useState } from 'react';
import { useProjectStore } from '../../stores/projectStore.ts';
import { useAuthStore } from '../../stores/authStore.ts';
import { api } from '../../lib/api.ts';
import { MessageSquare, Check, Trash2, Send, CornerDownRight, X, Clock } from 'lucide-react';

export const CommentsPanel: React.FC = () => {
  const { document, setDocument, setRightPanelTab } = useProjectStore();
  const { user } = useAuthStore();
  const [newCommentText, setNewCommentText] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('OPEN');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const comments = document?.comments || [];
  const filteredComments = comments.filter((c: any) => {
    if (filter === 'OPEN') return c.status === 'OPEN';
    if (filter === 'RESOLVED') return c.status === 'RESOLVED';
    return true;
  });

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !document) return;

    try {
      const res = await api.documents.createComment(document.id, {
        content: newCommentText,
      });

      const updatedComments = [res.comment, ...comments];
      setDocument({ ...document, comments: updatedComments });
      setNewCommentText('');
    } catch (err: any) {
      alert('Failed to add comment: ' + err.message);
    }
  };

  const handleToggleResolve = async (commentId: string, currentStatus: string) => {
    try {
      if (currentStatus === 'OPEN') {
        const res = await api.documents.resolveComment(commentId);
        const updated = comments.map((c: any) => (c.id === commentId ? res.comment : c));
        setDocument({ ...document, comments: updated });
      } else {
        const res = await api.documents.reopenComment(commentId);
        const updated = comments.map((c: any) => (c.id === commentId ? res.comment : c));
        setDocument({ ...document, comments: updated });
      }
    } catch (err: any) {
      alert('Failed to update comment: ' + err.message);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment thread?')) return;
    try {
      await api.documents.deleteComment(commentId);
      const updated = comments.filter((c: any) => c.id !== commentId);
      setDocument({ ...document, comments: updated });
    } catch (err: any) {
      alert('Failed to delete comment: ' + err.message);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#12141c] text-slate-100 border-l border-border select-text">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/80 bg-[#0e1017]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Comments & Feedback</h3>
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
        {(['OPEN', 'RESOLVED', 'ALL'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2.5 py-1 rounded transition ${
              filter === f ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            {f === 'OPEN' ? `Open (${comments.filter((c: any) => c.status === 'OPEN').length})` : f}
          </button>
        ))}
      </div>

      {/* Comment Creation Input */}
      <form onSubmit={handleAddComment} className="p-3 border-b border-border/60 bg-[#0f1118]">
        <div className="relative">
          <textarea
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Add general note or select text in editor..."
            rows={2}
            className="w-full p-2.5 bg-[#090a0f] border border-border rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={!newCommentText.trim()}
            className="absolute bottom-2 right-2 p-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded transition"
          >
            <Send className="w-3 h-3" />
          </button>
        </div>
      </form>

      {/* Comment List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredComments.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-30" />
            No {filter.toLowerCase()} feedback yet.
          </div>
        ) : (
          filteredComments.map((comment: any) => (
            <div
              key={comment.id}
              className={`p-3 rounded-lg border transition ${
                comment.status === 'RESOLVED'
                  ? 'bg-[#10121a]/60 border-border/40 opacity-70'
                  : 'bg-[#181b26] border-border hover:border-slate-600'
              }`}
            >
              {/* Highlighted text anchor */}
              {comment.selectedText && (
                <div className="mb-2 p-1.5 rounded bg-cyan-500/10 border-l-2 border-cyan-400 text-[11px] text-cyan-200 italic line-clamp-2">
                  "{comment.selectedText}"
                </div>
              )}

              {/* Author & Timestamp */}
              <div className="flex items-center justify-between mb-1.5 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-200">{comment.author?.name || 'Collaborator'}</span>
                  <span className="text-slate-500 text-[10px]">
                    {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleResolve(comment.id, comment.status)}
                    className={`p-1 rounded text-xs transition ${
                      comment.status === 'RESOLVED'
                        ? 'text-emerald-400 hover:bg-emerald-500/10'
                        : 'text-slate-400 hover:text-emerald-400 hover:bg-zinc-800'
                    }`}
                    title={comment.status === 'RESOLVED' ? 'Reopen comment' : 'Resolve comment'}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 hover:bg-zinc-800 rounded transition"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Comment Content */}
              <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
